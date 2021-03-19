import { manualPaginate } from '@/core';
import { Injectable } from '@nestjs/common';
import { omit } from 'lodash';
import { CreateCategoryDto, UpdateCategoryDto } from '../dtos';
import { QueryCategoryDto } from '../dtos/query-category.dto';
import { CategoryEntity } from '../entities';
import { CategoryRepository } from '../repositories';

/**
 * 内容分类服务
 *
 * @export
 * @class CategoryService
 */
@Injectable()
export class CategoryService {
    constructor(private categoryRepository: CategoryRepository) {}

    /**
     * 查询树形分类
     *
     * @return {*}
     * @memberof CategoryService
     */
    async findTrees() {
        return this.categoryRepository.findTrees();
    }

    /**
     * 查询分页后的扁平化分类
     *
     * @param {QueryCategoryDto} query
     * @return {*}
     * @memberof CategoryService
     */
    async paginate(query: QueryCategoryDto) {
        const tree = await this.findTrees();
        const list = await this.categoryRepository.toFlatTrees(tree);
        return manualPaginate(query, list);
    }

    /**
     * 查询分类信息
     *
     * @param {string} id
     * @return {*}
     * @memberof CategoryService
     */
    async findOne(id: string) {
        return this.categoryRepository.findOneOrFail(id, {
            relations: ['parent'],
        });
    }

    /**
     * 创建分类
     *
     * @param {CreateCategoryDto} data
     * @return {*}
     * @memberof CategoryService
     */
    async create(data: CreateCategoryDto) {
        const item = await this.categoryRepository.save(data);
        return this.findOne(item.id);
    }

    /**
     * 更新分类
     *
     * @param {UpdateCategoryDto} data
     * @return {*}
     * @memberof CategoryService
     */
    async update(data: UpdateCategoryDto) {
        await this.categoryRepository.update(data.id, {
            ...omit(data, 'id'),
        });
        return this.findOne(data.id);
    }

    /**
     * 删除分类
     *
     * @param {CategoryEntity} category
     * @return {*}
     * @memberof CategoryService
     */
    async delete(category: CategoryEntity) {
        return this.categoryRepository.remove(category);
    }
}
