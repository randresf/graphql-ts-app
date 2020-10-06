import { cacheExchange } from "@urql/exchange-graphcache";
import { createClient, dedupExchange, fetchExchange } from "urql";
import {
  LogoutMutation,
  MeQuery,
  MeDocument,
  LoginMutation,
  RegisterMutation
} from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";

const createUrqlClient = (ssrExchange: any) => ({
  url: "http://localhost:4000/graphql",
  fetchOptions: {
    credentials: "include" as const // make sure to send the cookie
  },
  exchanges: [
    dedupExchange,
    cacheExchange({
      // make sure to update cache for each mutation
      updates: {
        Mutation: {
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
    ssrExchange,
    fetchExchange
  ]
});

export default createUrqlClient;
