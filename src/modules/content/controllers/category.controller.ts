import { Depends, ParseUUIDEntityPipe } from '@/core';
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    SerializeOptions,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { ContentModule } from '../content.module';
import { CreateCategoryDto, UpdateCategoryDto } from '../dtos';
import { QueryCategoryDto } from '../dtos/query-category.dto';
import { CategoryEntity } from '../entities';
import { CategoryService } from '../services';
/**
 * 文章分类控制器
 *
 * @export
 * @class CategoryController
 */
@Depends(ContentModule)
@ApiTags('文章分类')
@Controller('categories')
export class CategoryController {
    constructor(protected categoryService: CategoryService) {}

    /**
     * 查询树形分类
     *
     * @return {*}
     * @memberof CategoryController
     */
    @Get()
    async index() {
        return this.categoryService.findTrees();
    }

    /**
     * 查询扁平化分类并分页
     *
     * @param {QueryCategoryDto} query
     * @return {*}
     * @memberof CategoryController
     */
    @Get('list')
    @SerializeOptions({ groups: ['flat-list'] })
    async list(
        @Query()
        query: QueryCategoryDto,
    ) {
        return this.categoryService.paginate(query);
    }

    /**
     * 查询分类信息
     *
     * @param {string} category
     * @return {*}
     * @memberof CategoryController
     */
    @Get(':category')
    @SerializeOptions({ groups: ['category-item'] })
    async show(
        @Param('category', new ParseUUIDEntityPipe(CategoryEntity, false))
        category: string,
    ) {
        return this.categoryService.findOne(category);
    }

    /**
     * 添加分类
     *
     * @param {CreateCategoryDto} data
     * @return {*}
     * @memberof CategoryController
     */
    @Post()
    async store(
        @Body()
        data: CreateCategoryDto,
    ) {
        return this.categoryService.create(data);
    }

    /**
     * 更新分类
     *
     * @param {UpdateCategoryDto} data
     * @return {*}
     * @memberof CategoryController
     */
    @Patch()
    async update(
        @Body()
        data: UpdateCategoryDto,
    ) {
        return this.categoryService.update(data);
    }

    /**
     * 删除分类
     *
     * @param {CategoryEntity} category
     * @return {*}
     * @memberof CategoryController
     */
    @ApiParam({ name: 'category', type: String })
    @Delete(':category')
    async destroy(
        @Param('category', new ParseUUIDEntityPipe(CategoryEntity))
        category: CategoryEntity,
    ) {
        return this.categoryService.delete(category);
    }
}
