import {
    DtoValidation,
    IsModelExist,
    PaginateDto,
    tBoolean,
    tNumber,
} from '@/core';
import { Injectable } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsBoolean,
    IsEnum,
    IsNumber,
    IsOptional,
    IsUUID,
    Min,
} from 'class-validator';
import { PostOrderType } from '../constants';
import { CategoryEntity } from '../entities';

/**
 * 文章列表查询数据验证
 *
 * @export
 * @class QueryPostDto
 */
@Injectable()
@DtoValidation({ type: 'query' })
export class QueryPostDto implements PaginateDto {
    /**
     * 过滤分类
     *
     * @type {string}
     * @memberof QueryPostDto
     */
    @ApiPropertyOptional({ description: '所属分类UUID' })
    @IsModelExist(CategoryEntity, {
        groups: ['update'],
        message: '指定的分类不存在',
    })
    @IsUUID(undefined, { message: '分类ID格式错误' })
    @IsOptional()
    category?: string;

    /**
     * 过滤发布状态
     * 不填则显示所有文章
     *
     * @type {boolean}
     * @memberof QueryPostDto
     */
    @ApiPropertyOptional({ description: '是否发布' })
    @Transform(({ value }) => tBoolean(value))
    @IsBoolean()
    @IsOptional()
    isPublished?: boolean;

    @ApiPropertyOptional({ description: '查看回收站', default: false })
    @Transform(({ value }) => tBoolean(value))
    @IsBoolean()
    @IsOptional()
    trashed?: boolean;

    /**
     * 排序方式
     * 不填则综合排序
     *
     * @type {PostOrderType}
     * @memberof QueryPostDto
     */
    @ApiPropertyOptional({ description: '排序规则', enum: PostOrderType })
    @IsEnum(PostOrderType, {
        message: `排序规则必须是${Object.values(PostOrderType).join(
            ',',
        )}其中一项`,
    })
    @IsOptional()
    orderBy?: PostOrderType;

    /**
     * 当前分页
     *
     * @memberof QueryPostDto
     */
    @ApiProperty({
        description: '当前页',
        default: 1,
        minimum: 1,
        type: Number,
    })
    @Transform(({ value }) => tNumber(value))
    @Min(1, { message: '当前页必须大于1' })
    @IsNumber()
    @IsOptional()
    page = 1;

    /**
     * 每页显示数据
     *
     * @memberof QueryPostDto
     */
    @ApiProperty({
        description: '每页显示数量',
        default: 10,
        minimum: 1,
        type: Number,
    })
    @Transform(({ value }) => tNumber(value))
    @Min(1, { message: '每页显示数据必须大于1' })
    @IsNumber()
    @IsOptional()
    limit = 10;
}
