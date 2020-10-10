import { Entity, PrimaryGeneratedColumn, UpdateDateColumn, Column, CreateDateColumn, BaseEntity, OneToMany } from "typeorm";
import { Field, ObjectType } from "type-graphql";
import moment from 'moment'
import { Post } from "./Post";
import { Updoot } from "./Updoot";

@ObjectType() // graphql
@Entity() // orm
export class User extends BaseEntity {
  @Field() // graphql
  @PrimaryGeneratedColumn() // orm
  id!: number;

  @Field()
  @Column({ unique: true })
  username!: string;

  @Field()
  @Column({ unique: true })
  email!: string;

  @Field()
  @Column()
  password!: string;

  @OneToMany(() => Post, post => post.creator)
  posts: Post[];

  @OneToMany(() => Updoot, updoot => updoot.user)
  updoots: Updoot[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt = moment.utc().format();

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt = moment.utc().format();
}
