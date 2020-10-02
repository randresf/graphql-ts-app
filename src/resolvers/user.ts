import { User } from "../entities/User";
import { MyContext } from "src/type";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Resolver
} from "type-graphql";
import { hash as argonHash, verify as argonVerify } from "argon2";

const dupUserNameCode = "23505";

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
  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
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
    const user = em.create(User, {
      username: options.username,
      password: hashedPwd
    });
    try {
      await em.persistAndFlush(user);
    } catch (error) {
      if (error.code == dupUserNameCode) {
        return {
          errors: [{ field: "username", message: "username already taken" }]
        };
      }
    }
    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
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
    await em.persistAndFlush(user);
    return { user };
  }
}
