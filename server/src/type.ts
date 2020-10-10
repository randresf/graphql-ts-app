import { Request, Response } from "express";
import { Redis } from "ioredis";

// defines the schema for the context
export type MyContext = {
  req: Request & { session: Express.Session };
  res: Response;
  redis: Redis;
};
