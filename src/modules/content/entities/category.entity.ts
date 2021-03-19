import { Exclude, Expose, Type } from 'class-transformer';
import {
    BaseEntity,
    Column,
    Entity,
    ManyToMany,
    PrimaryGeneratedColumn,
    Tree,
    TreeChildren,
    TreeParent,
} from 'typeorm';
import { PostEntity } from './post.entity';

/**
 * 分类模型
 *
 * @export
 * @class CategoryEntity
 * @extends {BaseEntity}
 */
@Exclude()
@Entity('content_categories')
@Tree('nested-set')
export class CategoryEntity extends BaseEntity {
    /**
     * 分类ID
     *
     * @type {string}
     * @memberof CategoryEntity
     */
    @Expose()
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    /**
     * 分类名称
     *
     * @type {string}
     * @memberof CategoryEntity
     */
    @Expose()
    @Column({ comment: '分类名称' })
    name!: string;

    /**
     * 分类排序
     *
     * @type {number}
     * @memberof CategoryEntity
     */
    @Expose()
    @Column({ comment: '分类排序', default: 0 })
    order!: number;

    /**
     * 分类关联的文章
     *
     * @type {PostEntity[]}
     * @memberof CategoryEntity
     */
    @ManyToMany((type) => PostEntity, (post) => post.categories)
    posts!: PostEntity[];

    /**
     * 子分类
     *
     * @type {CategoryEntity[]}
     * @memberof CategoryEntity
     */
    @Expose()
    @Type(() => CategoryEntity)
    @TreeChildren()
    children!: CategoryEntity[];

    /**
     * 父分类
     *
     * @type {CategoryEntity}
     * @memberof CategoryEntity
     */
    @Expose({ groups: ['category-item'] })
    @Type(() => CategoryEntity)
    @TreeParent()
    parent?: CategoryEntity | null;

    /**
     * 分类嵌套等级,只在打平时使用
     *
     * @type {number}
     * @memberof CategoryEntity
     */
    @Expose({ groups: ['flat-list'] })
    level = 0;
}
