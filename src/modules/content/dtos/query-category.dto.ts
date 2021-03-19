import { DtoValidation, PaginateDto, tNumber } from '@/core';
import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, Min } from 'class-validator';

/**
 * 扁平分类列表查询数据验证
 *
 * @export
 * @class QueryPostDto
 */
@Injectable()
@DtoValidation({ type: 'query' })
export class QueryCategoryDto implements PaginateDto {
    /**
     * 当前分页
     *
     * @memberof QueryCategoryDto
     */
    @ApiProperty({
        description: '当前页',
        default: 1,
        minimum: 1,
        type: Number,
    })
    @Transform(({ value }) => tNumber(value))
    @IsNumber()
    @Min(1, { message: '当前页必须大于1' })
    @IsOptional()
    page = 1;

    /**
     * 每页显示数据
     *
     * @memberof QueryCategoryDto
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
