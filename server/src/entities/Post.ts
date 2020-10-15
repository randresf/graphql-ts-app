import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column, BaseEntity, ManyToOne, OneToMany } from "typeorm";
import { Field, Int, ObjectType } from "type-graphql";
import moment from 'moment'
import { User } from "./User";
import { Updoot } from "./Updoot";

// we can stack decorators to re-use this class for the
// ORM but also for the graphql resolver
@ObjectType() // graphql allows to expone the fields
@Entity() // orm
export class Post extends BaseEntity { // allows Post.find or Post.insert
  @Field() // graphql
  @PrimaryGeneratedColumn() // orm
  id!: number;

  @Field()
  @Column()
  title!: string;

  @Field()
  @Column()
  text!: string;

  @Field()
  @Column({ type: 'int', default: 0 })
  points!: number;

  @Field(() => Int, { nullable: true })
  voteStatus: number | null // 1 or -1 or null

  @Field()
  @Column()
  creatorId!: number;

  @OneToMany(() => Updoot, updoot => updoot.post)
  updoots: Updoot[];

  @Field()
  @ManyToOne(() => User, user => user.posts)
  creator: User

  @Field(() => String) // commenting this will stop exposing searchs by this field
  @CreateDateColumn()
  createdAt = moment.utc().format();

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt = moment.utc().format();
}
