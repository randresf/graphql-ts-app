import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import path from "path";
import { User } from "./entities/User";

export default {
  migrations: {
    pattern: /^[\w-]+\d+\.[tj]s$/,
    path: path.join(__dirname, "./migrations")
  },
  entities: [Post, User],
  dbName: "redisReactGraphql", //   dbName: "redisReactGraphql",//
  type: "postgresql",
  debug: !__prod__,
  password: "admin" //   password: "admin"//
} as Parameters<typeof MikroORM.init>[0]; // parameters returns an array so we get only first
