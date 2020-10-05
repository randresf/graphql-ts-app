import { User } from "../entities/User";
import { MyContext } from "../type";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Resolver,
  Query
} from "type-graphql";
import { hash as argonHash, verify as argonVerify } from "argon2";
import { EntityManager } from "@mikro-orm/postgresql";
import { cookieName } from "../constants";

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[]; // ? mean it is optional
  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req, em }: MyContext) {
    // no logged in
    const { userId } = req.session;
    if (!userId) return null;

    const user = await em.findOne(User, { id: userId });
    return user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    if (options.username.length <= 2) {
      return {
        errors: [{ field: "username", message: "username too short" }]
      };
    }
    if (options.password.length <= 3) {
      return {
        errors: [{ field: "password", message: "password  too short" }]
      };
    }
    const hashedPwd = await argonHash(options.password);
    let user;
    try {
      const result = await (em as EntityManager)
        .createQueryBuilder(User)
        .getKnexQuery()
        .insert({
          username: options.username,
          password: hashedPwd,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning("*");
      user = result[0];
    } catch (error) {
      if (error.code === "23505") {
        return {
          errors: [{ field: "username", message: "username already taken" }]
        };
      }
    }
    // add session to keep new user logged in
    req.session.userId = user.id;
    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, {
      username: options.username
    });
    if (!user) {
      return {
        errors: [{ field: "username", message: "username does not exist" }]
      };
    }
    const valid = await argonVerify(user.password, options.password);
    if (!valid) {
      return {
        errors: [{ field: "password", message: "password does not match" }]
      };
    }
    // ! means the session object mught be undefined so in
    // MyContext we added the session type so we wont need it
    //req.session!.userId = user.id;
    req.session.userId = user.id;
    return { user };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(cookieName);
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }
        resolve(true);
      })
    );
  }
}