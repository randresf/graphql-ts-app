import { Cache, cacheExchange, Resolver } from "@urql/exchange-graphcache";
import { dedupExchange, Exchange, fetchExchange, stringifyVariables } from "urql";
import { pipe, tap } from 'wonka'
import {
  LogoutMutation,
  MeQuery,
  MeDocument,
  LoginMutation,
  RegisterMutation, VoteMutationVariables, DeletePostMutationVariables
} from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";
import Router from 'next/router'
import gql from 'graphql-tag'
import { isServer } from "./isServer";

const errorExchange: Exchange = ({ forward }) => ops$ => {
  return pipe(
    forward(ops$),
    tap(
      ({ error }) => {
        if (error?.message.includes('not authenticated')) {
          Router.replace('/login')
        }
      }

    )
  )
}

const invalidateAllPosts = (cache: Cache) => {
  const allFields = cache.inspectFields('Query');
  const fieldInfos = allFields.filter(info => info.fieldName === "posts");
  fieldInfos.forEach((fi) => {
    cache.invalidate("Query", "posts", fi.arguments || {})
  })
}

const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;

    const allFields = cache.inspectFields(entityKey);
    const fieldInfos = allFields.filter(info => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }
    // check if the data is in the cache and return it
    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`
    const isItInCache = cache.resolveFieldByKey(entityKey, fieldKey) as string[]
    info.partial = !isItInCache // make sure it calls the BE when there is not data
    const results: string[] = []
    let hasMore = true
    fieldInfos.forEach((fi) => {
      const key = cache.resolveFieldByKey(entityKey, fi.fieldKey) as string
      const data = cache.resolve(key, 'posts') as string[]
      const _hasMore = cache.resolve(key, 'hasMore')
      if (!_hasMore) {
        hasMore = _hasMore as boolean
      }
      results.push(...data)
    }
    )
    return { __typename: "PaginatedPosts", hasMore, posts: results }
  };
};
// this runs both in BE and FE, when we are in the SSR we need to pass the 
// browser's cookie manually since nextjs will not do it
const createUrqlClient = (ssrExchange: any, ctx: any) => {
  let cookie = ''
  if (isServer()) {
    cookie = ctx?.req?.headers.cookie
  }
  return {
    url: "http://localhost:4000/graphql",
    fetchOptions: {
      credentials: "include" as const, // make sure to send the cookie
      headers: cookie ? { cookie } : undefined // send cookie when SSR
    },
    exchanges: [
      dedupExchange,
      cacheExchange({
        keys: {
          PaginatedPosts: () => null
        },
        resolvers: {
          Query: {
            posts: cursorPagination()
          }
        },
        // make sure to update cache for each mutation
        updates: {
          Mutation: {
            deletePost: (result, args, cache, info) => {
              cache.invalidate({
                __typename: "Post",
                id: (args as DeletePostMutationVariables).id
              })
            },
            vote: (result, args, cache, info) => {
              // fragments will update the post on the cache
              const { postId, value } = args as VoteMutationVariables;
              const data = cache.readFragment(
                gql`
                fragment _ on Post {
                  id 
                  points
                  voteStatus
                }`, { id: postId } as any
              )
              if (data) {
                const { voteStatus, points } = data
                if (voteStatus === value) return;
                const newPoints = (points as number) + (!voteStatus ? 1 : 2) * value
                cache.writeFragment(
                  gql`
                  fragment __ on Post {
                    points
                    voteStatus
                  }
                `,
                  { id: postId, points: newPoints, voteStatus: value } as any
                )
              }
            },

            createPost: (result, args, cache, info) => {
              // invalidate all of the previous cache
              // so it reloads
              invalidateAllPosts(cache)
            },
            logout: (result, args, cache, info) => {
              betterUpdateQuery<LogoutMutation, MeQuery>(
                cache,
                { query: MeDocument },
                result,
                () => ({ me: null })
              );
            },

            login: (results, args, cache, info) => {
              betterUpdateQuery<LoginMutation, MeQuery>(
                cache,
                { query: MeDocument },
                results,
                (res, que) => {
                  if (res.login.errors) return que;
                  return { me: res.login.user };
                }
              );
              invalidateAllPosts(cache)
            },
            register: (results, args, cache, info) => {
              betterUpdateQuery<RegisterMutation, MeQuery>(
                cache,
                { query: MeDocument },
                results,
                (res, que) => {
                  if (res.register.errors) return que;
                  return { me: res.register.user };
                }
              );
            }
          }
        }
      }),
      errorExchange,
      ssrExchange,
      fetchExchange
    ]
  }
};

export default createUrqlClient;
