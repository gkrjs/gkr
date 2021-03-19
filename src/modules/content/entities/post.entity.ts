import { entityDate } from '@/core';
import { UserEntity } from '@/modules/user/entities';
import { Exclude, Expose, Type } from 'class-transformer';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { PostBodyType } from '../constants';
import { CategoryEntity } from './category.entity';
import { CommentEntity } from './comment.entity';

/**
 * 文章模型
 *
 * @export
 * @class PostEntity
 * @extends {BaseEntity}
 */
@Exclude()
@Entity('content_posts')
export class PostEntity extends BaseEntity {
    /**
     * 文章ID
     *
     * @type {string}
     * @memberof PostEntity
     */
    @Expose()
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    /**
     * 文章标题
     *
     * @type {string}
     * @memberof PostEntity
     */
    @Expose()
    @Column({ comment: '文章标题' })
    title!: string;

    /**
     * 文章内容
     *
     * @type {string}
     * @memberof PostEntity
     */
    @Expose({ groups: ['post-item'] })
    @Column({ comment: '文章内容', type: 'longtext' })
    body!: string;

    /**
     * 文章描述
     *
     * @type {string}
     * @memberof PostEntity
     */
    @Expose()
    @Column({ comment: '文章描述', nullable: true })
    summary?: string;

    /**
     * 关键字
     *
     * @type {string[]}
     * @memberof PostEntity
     */
    @Expose()
    @Column({ comment: '关键字', type: 'simple-array', nullable: true })
    keywords?: string[];

    /**
     * 是否发布
     *
     * @type {boolean}
     * @memberof PostEntity
     */
    @Expose()
    @Column({ comment: '是否发布', default: false })
    isPublished?: boolean;

    /**
     * 文章关联的分类
     *
     * @type {CategoryEntity[]}
     * @memberof PostEntity
     */
    @Expose()
    @Type(() => CategoryEntity)
    @ManyToMany((type) => CategoryEntity, (category) => category.posts, {
        cascade: true,
    })
    @JoinTable()
    categories!: CategoryEntity[];

    /**
     * 文章下的评论
     *
     * @type {CommentEntity[]}
     * @memberof PostEntity
     */
    @Expose({ groups: ['post-item'] })
    @Type(() => CommentEntity)
    @OneToMany(() => CommentEntity, (comment) => comment.post, {
        cascade: true,
    })
    comments!: CommentEntity[];

    /**
     * 发布时间
     *
     * @type {(Date | null)}
     * @memberof PostEntity
     */
    @Expose()
    @Column({
        comment: '发布时间',
        type: 'varchar',
        nullable: true,
        transformer: entityDate(),
    })
    publishedAt?: Date | null;

    /**
     * 创建时间
     *
     * @type {Date}
     * @memberof PostEntity
     */
    @Expose()
    @CreateDateColumn({
        comment: '创建时间',
        transformer: entityDate(),
    })
    createdAt!: Date;

    /**
     * 更新时间
     *
     * @type {Date}
     * @memberof PostEntity
     */
    @Expose()
    @UpdateDateColumn({
        comment: '更新时间',
        transformer: entityDate(),
    })
    updatedAt!: Date;

    /**
     * 软删除时间
     *
     * @type {Date}
     * @memberof PostEntity
     */
    @DeleteDateColumn({ comment: '软删除' })
    deletedAt!: Date;

    /**
     * 文章内容类型
     *
     * @type {PostBodyType}
     * @memberof PostEntity
     */
    @Column({
        type: 'enum',
        enum: PostBodyType,
        default: PostBodyType.MD,
    })
    type!: PostBodyType;

    /**
     * 文章作者
     *
     * @type {UserEntity}
     * @memberof PostEntity
     */
    @Expose()
    @Type(() => UserEntity)
    @ManyToOne(() => UserEntity, (user) => (user as any).posts, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        nullable: false,
    })
    author!: UserEntity;

    /**
     * 评论数量
     *
     * @type {number}
     * @memberof PostEntity
     */
    @Expose()
    commentCount!: number;

    /**
     * 是否位于回收站
     *
     * @type {boolean}
     * @memberof PostEntity
     */
    @Expose()
    trashed!: boolean;
}
