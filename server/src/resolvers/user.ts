import { User } from "../entities/User";
import { MyContext } from "../type";
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Resolver,
  Query, FieldResolver, Root
} from "type-graphql";
import { hash as argonHash, verify as argonVerify } from "argon2";
import { cookieName, FORGET_PWD_PREFIX } from "../constants";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";
import { getConnection } from "typeorm";

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

@Resolver(User)
export class UserResolver {

  @FieldResolver(() => String)
  email(
    @Root() user: User, @Ctx() { req }: MyContext
  ) {
    if (req.session.userId === user.id) return user.email
    return ''
  }

  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: MyContext) {
    // no logged in
    const { userId } = req.session;
    if (!userId) return null;

    return User.findOne(userId);

  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);
    if (errors) return { errors };
    const hashedPwd = await argonHash(options.password);
    let user;
    try {
      // User.create({opts}).save()
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          username: options.username,
          password: hashedPwd,
          email: options.email
        }).returning('*').execute()
      user = result.raw[0]
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
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne(
      {
        where:
          usernameOrEmail.includes("@")
            ? { email: usernameOrEmail }
            : { username: usernameOrEmail }
      }
    );
    if (!user) {
      return {
        errors: [
          { field: "usernameOrEmail", message: "username does not exist" }
        ]
      };
    }
    const valid = await argonVerify(user.password, password);
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

  @Mutation(() => Boolean)
  async forgotPassword(
    @Ctx() { redis }: MyContext,
    @Arg("email") email: string
  ) {
    const user = await User.findOne({ where: { email } });
    // in case is called from somewhere else we dont need to say that this user exists or no
    if (!user) return true;
    const token = v4();
    await redis.set(
      `${FORGET_PWD_PREFIX}${token}`,
      user.id,
      "ex",
      1000 * 60 * 60 * 24 * 3
    ); // 3 days
    await sendEmail(
      email,
      `<a href="http://localhost:3000/change-pwd/${token}">reset password</a>`
    );
    return true;
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { redis, req }: MyContext
  ) {
    if (newPassword.length <= 2) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "length must be greater than 2"
          }
        ]
      };
    }
    const key = FORGET_PWD_PREFIX + token
    const userId = await redis.get(key);

    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "invalid token"
          }
        ]
      };
    }
    const userIdNum = parseInt(userId)
    const user = await User.findOne(userIdNum);

    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "user no longer exists"
          }
        ]
      };
    }
    await User.update({
      id: userIdNum
    },
      { password: await argonHash(newPassword) }
    );

    // remove used token  
    await redis.del(key);
    // login after change
    req.session.userId = user.id;
    return { user };
  }
}
