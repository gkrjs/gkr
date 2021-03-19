import {
    DtoValidation,
    IsModelExist,
    IsTreeUnique,
    IsTreeUniqueExist,
    tNumber,
} from '@/core';
import { Injectable } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsUUID,
    MaxLength,
} from 'class-validator';
import { getManager } from 'typeorm';
import { CategoryEntity } from '../entities';
import { CategoryRepository } from '../repositories';
import { UpdateCategoryDto } from './update-category.dto';

/**
 * 创建分类数据验证
 *
 * @export
 * @class CreateCategoryDto
 */
@Injectable()
@DtoValidation({ groups: ['create'] })
export class CreateCategoryDto {
    @ApiProperty({ description: '分类名称,同级别唯一' })
    @IsTreeUnique(
        { entity: CategoryEntity },
        {
            groups: ['create'],
            message: '分类名称重复',
        },
    )
    @IsTreeUniqueExist(
        { entity: CategoryEntity },
        {
            groups: ['update'],
            message: '分类名称重复',
        },
    )
    @MaxLength(25, {
        always: true,
        message: '分类名称长度不能超过$constraint1',
    })
    @IsNotEmpty({ groups: ['create'], message: '分类名称不得为空' })
    name!: string;

    @ApiPropertyOptional({ description: '分类排序', type: Number, default: 0 })
    @Transform(({ value }) => tNumber(value))
    @IsNumber(undefined, { message: '排序必须为整数' })
    @IsOptional({ always: true })
    order?: number;

    @ApiPropertyOptional({ description: '父分类UUID', type: 'string' })
    @IsModelExist(CategoryEntity, { always: true, message: '父分类不存在' })
    @IsUUID(undefined, { always: true, message: '分类ID格式不正确' })
    @IsOptional({ always: true })
    parent?: CategoryEntity;

    async transform(obj: CreateCategoryDto | UpdateCategoryDto) {
        const em = getManager();
        if (obj.parent) {
            obj.parent = await em
                .getCustomRepository(CategoryRepository)
                .findOneOrFail(obj.parent);
        }
        return obj;
    }
}
