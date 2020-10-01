import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import path from "path";

export default {
  migrations: {
    pattern: /^[\w-]+\d+\.[tj]s$/,
    path: path.join(__dirname, "./migrations")
  },
  entities: [Post],
  dbName: "redisReactGraphql",
  type: "postgresql",
  debug: !__prod__,
  password: "admin"
} as Parameters<typeof MikroORM.init>[0]; // parameters returns an array so we get only first
