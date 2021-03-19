import { DtoValidation, IsModelExist, PartialDto } from '@/core';
import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsUUID } from 'class-validator';
import { CategoryEntity } from '../entities';
import { CreateCategoryDto } from './create-category.dto';

/**
 * 更新分类数据验证
 *
 * @export
 * @class UpdateCategoryDto
 * @extends {PartialDto(CreateCategoryDto)}
 */
@Injectable()
@DtoValidation({ groups: ['update'] })
export class UpdateCategoryDto extends PartialDto(CreateCategoryDto) {
    @ApiProperty({ description: '分类UUID' })
    @IsModelExist(CategoryEntity, {
        groups: ['update'],
        message: '指定的分类不存在',
    })
    @IsUUID(undefined, { groups: ['update'], message: '分类ID格式错误' })
    @IsDefined({ groups: ['update'], message: '分类ID必须指定' })
    id!: string;
}
