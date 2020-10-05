import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";

// we can stack decorators to re-use this class for the
// ORM but also for the graphql resolver
@ObjectType() // graphql
@Entity() // orm
export class Post {
  @Field() // graphql
  @PrimaryKey() // orm
  id!: number;

  @Field(() => String) // commenting this will stop exposing searchs by this field
  @Property({ type: "date" })
  createdAt = new Date();

  @Field(() => String)
  @Property({ type: "date", onUpdate: () => new Date() })
  updatedAt = new Date();

  @Field()
  @Property({ type: "text" })
  title!: string;
}
