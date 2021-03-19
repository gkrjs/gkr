import { entityDate } from '@/core';
import { UserEntity } from '@/modules/user/entities';
import { Exclude, Expose, Type } from 'class-transformer';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    Tree,
    TreeChildren,
    TreeParent,
} from 'typeorm';
import { PostEntity } from './post.entity';

/**
 * 评论模型
 *
 * @export
 * @class CommentEntity
 * @extends {BaseEntity}
 */
@Exclude()
@Entity('content_comments')
@Tree('nested-set')
export class CommentEntity extends BaseEntity {
    /**
     * 评论ID
     *
     * @type {string}
     * @memberof CommentEntity
     */
    @Expose()
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    /**
     * 评论内容
     *
     * @type {string}
     * @memberof CommentEntity
     */
    @Expose()
    @Column({ comment: '评论内容', type: 'longtext' })
    body!: string;

    /**
     * 评论所属文章
     *
     * @type {PostEntity}
     * @memberof CommentEntity
     */
    @ManyToOne(() => PostEntity, (post) => post.comments, {
        nullable: false,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    post!: PostEntity;

    /**
     * 评论创建时间
     *
     * @type {Date}
     * @memberof CommentEntity
     */
    @CreateDateColumn({
        comment: '创建时间',
        transformer: entityDate(),
    })
    @Expose()
    createdAt!: Date;

    /**
     * 子评论
     *
     * @type {CommentEntity[]}
     * @memberof CommentEntity
     */
    @TreeChildren()
    children!: CommentEntity[];

    /**
     * 父评论
     *
     * @type {CommentEntity}
     * @memberof CommentEntity
     */
    @TreeParent()
    parent?: CommentEntity;

    /**
     * 评论发布者
     *
     * @type {UserEntity}
     * @memberof CommentEntity
     */
    @Expose()
    @Type(() => UserEntity)
    @ManyToOne(() => UserEntity, (user) => (user as any).comments, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    creator!: UserEntity;
}
