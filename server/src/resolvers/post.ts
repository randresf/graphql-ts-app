import { Post } from "../entities/Post";
import { Arg, Ctx, Field, FieldResolver, InputType, Int, Mutation, ObjectType, Query, Resolver, Root, UseMiddleware } from "type-graphql";
import { MyContext } from "../type";
import { isAuth } from "../middleware/isAuth";
import { getConnection } from "typeorm";
import { Updoot } from "../entities/Updoot";
import { User } from "../entities/User";

@InputType()
class PostInput {
  @Field()
  title: string
  @Field()
  text: string
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[]
  @Field()
  hasMore: Boolean
}

// graphql map for posts
@Resolver(Post)
export class PostResolver {

  // FieldResolvers only runs if the graphql request the field
  @FieldResolver(() => String)
  textSnipped(
    @Root() root: Post
  ) {
    return root.text.slice(0, 50)
  }

  // fetching usr alwayr the post is required
  // @FieldResolver(() => User)
  // creator(
  //   @Root() post: Post
  // ) {
  //   return User.findOne(post.creatorId)
  // } BAD PERFORMANCE, doing one select for each Post creator when loading list of post, so causing a n+1
  @FieldResolver(() => User)
  creator(
    @Root() post: Post,
    @Ctx() { userLoader }: MyContext
  ) {
    // batches all the ids in one call and caches if its needed later
    return userLoader.load(post.creatorId)
  }

  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() post: Post,
    @Ctx() { updootLoader, req }: MyContext
  ) {
    const { userId } = req.session
    if (!userId) return null
    // batches all the ids in one call and caches if its needed later
    const updoot = await updootLoader.load({ userId, postId: post.id })
    return updoot ? updoot.value : null
  }

  @Mutation(() => Boolean)
  async vote(
    @Arg('postId', () => Int) postId: number,
    @Arg('value', () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    const { userId } = req.session

    const upDoot = await Updoot.findOne({ where: { postId, userId } })
    const realValue = value !== -1 ? 1 : -1

    if (upDoot && upDoot.value !== realValue) {
      // voted but changed vote
      await getConnection().transaction(async (tm) => {
        await tm.query(`
            update updoot
            set value = $1
            where "postId" = $2 and "userId" = $3
          `, [userId, postId, realValue]
        )
        await tm.query(`
            update post 
            set points = points + $1
            where id = $2;
          `, [2 * realValue, postId]
        )
      })

    } else if (!upDoot) {
      // has never voted
      await getConnection().transaction(async (tm) => {
        await tm.query(`
            insert into updoot ("userId","postId", value)
            values ($1, $2, $3)
          `, [userId, postId, realValue]
        )
        await tm.query(`
            update post 
            set points = points + $1
            where id = $2;
          `, [realValue, postId]
        )
      })
    }
    // await Post.update({
    //   id:postId
    // })
    return true
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedPosts> {
    // to know if there is more data, add 1 to the limit
    const realLimit = Math.min(50, limit)
    const realLimitPlusOne = realLimit + 1
    const replacements: any[] = [realLimitPlusOne]
    if (cursor) {
      replacements.push(new Date(parseInt(cursor)))
    }

    // return all posts
    // const qb = getConnection()
    //   .getRepository(Post)
    //   .createQueryBuilder("p")
    //   .innerJoinAndSelect("p.creator", "u", 'u.id = p."creatorId"')
    //   .orderBy('p."createdAt"', "DESC") // postgress need quotes
    //   .take(realLimitPlusOne)
    // if (cursor) qb.where('p."createdAt" > :cursor', { cursor: new Date(parseInt(cursor)) })
    // const posts = await qb.getMany()
    const posts = await getConnection().query(
      `
        select p.*
        from post p
        ${cursor ? `where p."createdAt" < $2` : ''}
        order by p."createdAt" DESC
        limit $1
      `, replacements
    )
    return { posts: posts.slice(0, realLimit), hasMore: posts.length === realLimitPlusOne };
  }

  @Query(() => Post, { nullable: true })
  post(
    @Arg("id", () => Int) id: number // "id" sets the expected prop name for the arg
  ): Promise<Post | undefined> {
    // either a post or null
    // return post by id
    return Post.findOne(id);
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input") input: PostInput, // "id" sets the expected prop name for the arg
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    const { userId } = req.session
    // this makes 2 sql, one to create and one to select
    return Post.create({
      ...input,
      creatorId: userId
    })
      .save();
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg("id", () => Int) id: number, // "id" sets the expected prop name for the arg
    @Arg("title") title: string, // if thhe param can be empty the type and nullable must be set
    @Arg("text") text: string,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    const { raw: result = [] } = await getConnection()
      .createQueryBuilder()
      .update(Post)
      .set({ title, text })
      .where('id = :id and "creatorId" = :creatorId', { id, creatorId: req.session.userId })
      .returning("*")
      .execute()
    return result[0] as any
  }

  @Mutation(() => Boolean) // should reflect the type is returned from the method
  async deletePost(
    @Arg("id", () => Int) id: number, // "id" sets the expected prop name for the arg
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    // this way is manually checking for relations
    // const post = Post.findOne(id)
    // if (post) {
    //   return false
    // }
    // if (post.creatorId !== req.session.userId) {
    //   throw new Error("not authorized")
    // }

    // await Updoot.delete({ postId: id });
    // await Post.delete({ id });

    // the other way is to update the entity relationship and just delete here
    await Post.delete({ id, creatorId: req.session.userId });
    return true;
  }
}
