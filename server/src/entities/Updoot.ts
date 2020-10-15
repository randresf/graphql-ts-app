import { Entity, BaseEntity, ManyToOne, PrimaryColumn, Column } from "typeorm";
import { User } from "./User";
import { Post } from "./Post";

// we can stack decorators to re-use this class for the
// ORM but also for the graphql resolver
@Entity() // orm
export class Updoot extends BaseEntity { // allows Updoot.find or Updoot.insert
    @Column({ type: 'int' })
    value: number;

    @PrimaryColumn()
    userId: number;

    @ManyToOne(() => User, user => user.updoots)
    user: User;

    @PrimaryColumn()
    postId: number;

    @ManyToOne(() => Post, post => post.updoots, {
        onDelete: 'CASCADE'
    })
    post: Post;

}
