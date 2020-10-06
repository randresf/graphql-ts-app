import { Post } from "../entities/Post";
import { MyContext } from "src/type";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";

// graphql map for posts
@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(
    @Ctx() { em }: MyContext // use the em (entity manager) from context
  ): Promise<Post[]> {
    // return all posts
    return em.find(Post, {});
  }

  @Query(() => Post, { nullable: true })
  post(
    @Arg("id") id: number, // "id" sets the expected prop name for the arg
    @Ctx() { em }: MyContext // use the em (entity manager) from context
  ): Promise<Post | null> {
    // either a post or null
    // return post by id
    return em.findOne(Post, { id });
  }

  @Mutation(() => Post)
  async createPost(
    @Arg("title") title: string, // "id" sets the expected prop name for the arg
    @Ctx() { em }: MyContext // use the em (entity manager) from context
  ): Promise<Post> {
    const post = em.create(Post, { title });
    await em.persistAndFlush(post);
    return post;
  }

  @Mutation(() => Post)
  async updatePost(
    @Arg("id") id: number, // "id" sets the expected prop name for the arg
    @Arg("title", () => String, { nullable: true }) title: string, // if thhe param can be empty the type and nullable must be set
    @Ctx() { em }: MyContext // use the em (entity manager) from context
  ): Promise<Post | null> {
    const post = await em.findOne(Post, { id });
    if (!post) return null;
    if (typeof title !== "undefined") {
      post.title = title;
      await em.persistAndFlush(post);
    }
    return post;
  }

  @Mutation(() => Boolean) // should reflect the type is returned from the method
  async deletePost(
    @Arg("id") id: number, // "id" sets the expected prop name for the arg
    @Ctx() { em }: MyContext // use the em (entity manager) from context
  ): Promise<boolean> {
    await em.nativeDelete(Post, { id });
    return true;
  }
}
