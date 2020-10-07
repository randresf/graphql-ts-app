import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { cookieName, __prod__ } from "./constants";
import microConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import { sendEmail } from "./utils/sendEmail";

import session from "express-session";
import Redis from "ioredis";
import connectRedis from "connect-redis";
import cors from "cors";

const main = async () => {
  sendEmail("bob@bob.com", "hello there");
  // connect to the db
  const orm = await MikroORM.init(microConfig);

  // run migrations before doing something else
  await orm.getMigrator().up();

  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new Redis();
  // the order of the middleware use matters
  app.use(
    // apply to all routes
    cors({
      origin: "http://localhost:3000",
      credentials: true
    })
  );

  app.use(
    session({
      name: cookieName,
      store: new RedisStore({ client: redis, disableTouch: true }), // disable Touch TTL, meaning the session is alive until manual removal
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true, // html readonly
        secure: __prod__, // means it will work only on https for prod
        sameSite: "lax" // csrf
      },
      saveUninitialized: false,
      secret: "asasdadadadasd",
      resave: false // make sure does  not continue to ping redis
    })
  );

  const apolloSv = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false
    }),
    // express provides the request object so we can access to req and res
    context: ({ res, req }) => ({ em: orm.em, req, res, redis }) // provide the context to the resolvers
  });

  // adding cors:{origin:"http://localhost:3000"} here will fix cors issue but only for this route
  // better add a cors middleware so its global
  apolloSv.applyMiddleware({ app, cors: false });

  app.listen(4000, () => {
    console.log("listening on port localhost:4000");
  });
};

main().catch((err) => {
  console.error(err);
});
