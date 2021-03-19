import { DtoValidation, IsModelExist, tBoolean } from '@/core';
import { Injectable } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsBoolean,
    IsNotEmpty,
    IsOptional,
    IsUUID,
    MaxLength,
} from 'class-validator';
import { getManager } from 'typeorm';
import { CategoryEntity } from '../entities';
import { CategoryRepository } from '../repositories';
import { UpdatePostDto } from './update-post.dto';

/**
 * 创建文章数据验证
 *
 * @export
 * @class CreatePostDto
 */
@Injectable()
@DtoValidation({ groups: ['create'] })
export class CreatePostDto {
    @ApiProperty({ description: '文章标题' })
    @MaxLength(255, {
        always: true,
        message: '文章标题长度最大为$constraint1',
    })
    @IsNotEmpty({ groups: ['create'], message: '文章标题必须填写' })
    title!: string;

    @ApiProperty({ description: '文章内容' })
    @IsNotEmpty({ groups: ['create'], message: '文章内容必须填写' })
    body!: string;

    @ApiPropertyOptional({ description: '是否发布' })
    @Transform(({ value }) => tBoolean(value))
    @IsBoolean()
    @IsOptional({ always: true })
    isPublished?: boolean;

    @ApiPropertyOptional({ description: '文章摘要' })
    @MaxLength(500, {
        always: true,
        message: '文章描述长度最大为$constraint1',
    })
    @IsOptional({ always: true })
    summary?: string;

    @ApiPropertyOptional({ description: '关键字', type: [String] })
    @MaxLength(20, {
        each: true,
        always: true,
        message: '每个关键字长度最大为$constraint1',
    })
    @IsOptional({ always: true })
    keywords?: string[];

    @ApiPropertyOptional({ description: '文章所属分类UUID', type: [String] })
    @IsModelExist(CategoryEntity, {
        each: true,
        always: true,
        message: '分类不存在',
    })
    @IsUUID(undefined, { each: true, always: true, message: '分类ID格式错误' })
    @IsOptional({ always: true })
    categories?: CategoryEntity[];

    async transform(obj: CreatePostDto | UpdatePostDto) {
        const em = getManager();
        if (obj.categories) {
            obj.categories = await em
                .getCustomRepository(CategoryRepository)
                .findByIds(obj.categories);
        }
        return obj;
    }
}
