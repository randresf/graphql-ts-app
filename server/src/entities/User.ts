import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";

@ObjectType() // graphql
@Entity() // orm
export class User {
  @Field() // graphql
  @PrimaryKey() // orm
  id!: number;

  @Field(() => String)
  @Property({ type: "date" })
  createdAt = new Date();

  @Field(() => String)
  @Property({ type: "date", onUpdate: () => new Date() })
  updatedAt = new Date();

  @Field()
  @Property({ type: "text", unique: true })
  username!: string;

  @Field()
  @Property({ type: "text", unique: true })
  email!: string;

  @Field()
  @Property({ type: "text" })
  password!: string;
}
