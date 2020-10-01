import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import microConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";

const main = async () => {
  // connect to the db
  const orm = await MikroORM.init(microConfig);
  // run migrations before doing something else
  await orm.getMigrator().up();

  const app = express();

  const apolloSv = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver],
      validate: false
    }),
    context: () => ({ em: orm.em })
  });

  apolloSv.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log("listening on port localhost:4000");
  });
};

main().catch((err) => {
  console.error(err);
});
