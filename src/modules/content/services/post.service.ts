import { QueryHook } from '@/core';
import { UserEntity } from '@/modules/user/entities';
import { Injectable } from '@nestjs/common';
import { omit } from 'lodash';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { SelectQueryBuilder } from 'typeorm';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { PostOrderType } from '../constants';
import { CreatePostDto, QueryPostDto, UpdatePostDto } from '../dtos';
import { DeletePostMultiDto } from '../dtos/delete-post-multi.dto';
import { PostEntity } from '../entities';
import { CategoryRepository, PostRepository } from '../repositories';
import { CategoryService } from './category.service';

// 文章查询接口
type FindParams = {
    [key in keyof Omit<QueryPostDto, 'limit' | 'page'>]: QueryPostDto[key];
};

/**
 * 文章服务
 *
 * @export
 * @class PostService
 */
@Injectable()
export class PostService {
    constructor(
        private categoryRepository: CategoryRepository,
        private postRepository: PostRepository,
        private categoryService: CategoryService,
    ) {}

    /**
     * 查询文章列表,分页输出数据
     *
     * @param {FindParams} params
     * @param {IPaginationOptions} options
     * @returns
     * @memberof PostService
     */
    async paginate(params: FindParams, options: IPaginationOptions) {
        const query = await this.getListQuery(params);
        return paginate<PostEntity>(query, options);
    }

    /**
     * 查询一篇文章的详细信息
     *
     * @param {string} id
     * @returns
     * @memberof PostService
     */
    async findOne(id: string) {
        const query = await this.getItemQuery();
        const item = await query.where('post.id = :id', { id }).getOne();
        if (!item) throw new EntityNotFoundError(PostEntity, id);
        return item;
    }

    async create(user: UserEntity, data: CreatePostDto) {
        const item = await this.postRepository.save({ ...data, author: user });
        return this.findOne(item.id);
    }

    async update(data: UpdatePostDto) {
        const post = await this.postRepository.findOneOrFail(data.id);
        if (data.categories) {
            await this.postRepository
                .createQueryBuilder('post')
                .relation(PostEntity, 'categories')
                .of(post)
                .addAndRemove(data.categories ?? [], post.categories ?? []);
        }
        await this.postRepository.update(
            data.id,
            omit(data, ['id', 'categories']),
        );
        return this.findOne(data.id);
    }

    /**
     *删除文章
     *
     * @param {PostEntity} post
     * @param {boolean} [trash=true]
     * @return {*}
     * @memberof PostService
     */
    async delete(post: PostEntity, trash = true) {
        return trash
            ? this.postRepository.softDelete(post)
            : this.postRepository.delete(post);
    }

    /**
     * 删除多篇文章
     *
     * 如果查询的列表是回收站的则直接硬删除
     *
     * @param {DeletePostMultiDto} { posts }
     * @param {FindParams} query
     * @param {IPaginationOptions} options
     * @return {*}
     * @memberof PostService
     */
    async deleteMulti(
        { posts }: DeletePostMultiDto,
        query: FindParams,
        options: IPaginationOptions,
    ) {
        query.trashed
            ? await this.postRepository.remove(posts)
            : await this.postRepository.softRemove(posts);
        return this.paginate(query, options);
    }

    /**
     * 查询一篇文章的Query构建
     *
     * @protected
     * @param {QueryHook<PostEntity>} [callback]
     * @returns
     * @memberof PostService
     */
    protected async getItemQuery(callback?: QueryHook<PostEntity>) {
        let query = this.postRepository
            .buildBaseQuery()
            .leftJoinAndSelect('post.comments', 'comments');
        if (callback) {
            query = await callback(query);
        }
        return query;
    }

    /**
     * 根据条件查询文章列表的Query构建
     *
     * @protected
     * @param {FindParams} [params={}]
     * @param {FindHook} [callback]
     * @returns
     * @memberof PostService
     */
    protected async getListQuery(
        params: FindParams = {},
        callback?: QueryHook<PostEntity>,
    ) {
        const { category, orderBy, isPublished, trashed } = params;
        let query = this.postRepository.buildBaseQuery();
        if (isPublished !== undefined && typeof isPublished === 'boolean') {
            query = query.where('post.isPublished = :isPublished', {
                isPublished,
            });
        }
        query.andWhere(`post.deletedAt is ${trashed ? 'not null' : 'null'}`);
        query = this.queryOrderBy(query, orderBy);
        if (callback) {
            query = await callback(query);
        }
        if (category) {
            query = await this.queryByCategory(category, query);
        }
        return query;
    }

    /**
     * 对文章进行排序的Query构建
     *
     * @protected
     * @param {SelectQueryBuilder<PostEntity>} query
     * @param {PostOrderType} [orderBy]
     * @returns
     * @memberof PostService
     */
    protected queryOrderBy(
        query: SelectQueryBuilder<PostEntity>,
        orderBy?: PostOrderType,
    ) {
        switch (orderBy) {
            case PostOrderType.CREATED:
                return query.orderBy('post.createdAt', 'DESC');
            case PostOrderType.UPDATED:
                return query.orderBy('post.updatedAt', 'DESC');
            case PostOrderType.PUBLISHED:
                return query.orderBy('post.publishedAt', 'DESC');
            case PostOrderType.COMMENTCOUNT:
                return query.orderBy('commentCount', 'DESC');
            default:
                return query
                    .orderBy('post.createdAt', 'DESC')
                    .addOrderBy('post.updatedAt', 'DESC')
                    .addOrderBy('post.publishedAt', 'DESC')
                    .addOrderBy('commentCount', 'DESC');
        }
    }

    /**
     * 查询出分类及其后代分类下的所有文章的Query构建
     *
     * @param {string} id
     * @param {SelectQueryBuilder<PostEntity>} query
     * @returns
     * @memberof PostService
     */
    protected async queryByCategory(
        id: string,
        query: SelectQueryBuilder<PostEntity>,
    ) {
        const root = await this.categoryService.findOne(id);
        const tree = await this.categoryRepository.findDescendantsTree(root);
        const flatDes = await this.categoryRepository.toFlatTrees(
            tree.children,
        );
        const ids = [tree.id, ...flatDes.map((item) => item.id)];
        return query.where('categories.id IN (:...ids)', {
            ids,
        });
    }
}
