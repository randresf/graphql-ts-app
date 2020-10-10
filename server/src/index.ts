import "reflect-metadata"; // needed for tyorm and mikro-orm
import { cookieName, __prod__ } from "./constants";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

import session from "express-session";
import Redis from "ioredis";
import connectRedis from "connect-redis";
import cors from "cors";
import { createConnection } from 'typeorm'
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import path from 'path'
import { Updoot } from "./entities/Updoot";

const main = async () => {

  // connect to the db
  const conn = await createConnection({
    type: 'postgres',
    database: 'graphql-ts-app',
    username: 'randresf',
    password: 'randresf',
    logging: true,
    synchronize: true, // creates the tables without migrations,
    entities: [Post, User, Updoot],
    migrations: [path.join(__dirname, "./migrations/*")]
  })

  await conn.runMigrations()

  // await Post.delete({})

  //run migrations before doing something else

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
      saveUninitialized: false, // do not create default session
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
    context: ({ res, req }) => ({ req, res, redis }) // provide the context to the resolvers
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
