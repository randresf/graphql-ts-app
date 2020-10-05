import { Cache, QueryInput } from "@urql/exchange-graphcache";

// this is used to redefine the types for typescript for
// the cacheExhange mutation
export function betterUpdateQuery<Result, Query>(
  cache: Cache,
  qi: QueryInput,
  result: any,
  fn: (r: Result, q: Query) => Query
) {
  return cache.updateQuery(qi, (data) => fn(result, data as any) as any);
}
