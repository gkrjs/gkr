import { DtoValidation, IsModelExist, PartialDto } from '@/core';
import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsUUID } from 'class-validator';
import { PostEntity } from '../entities';
import { CreatePostDto } from './create-post.dto';

/**
 * 更新文章数据验证
 *
 * @export
 * @class UpdatePostDto
 * @extends {PartialDto(CreatePostDto)}
 */
@Injectable()
@DtoValidation({ groups: ['update'] })
export class UpdatePostDto extends PartialDto(CreatePostDto) {
    @ApiProperty({ description: '文章UUID' })
    @IsModelExist(PostEntity, {
        groups: ['update'],
        message: '指定的文章不存在',
    })
    @IsUUID(undefined, { groups: ['update'], message: '文章ID格式错误' })
    @IsDefined({ groups: ['update'], message: '文章ID必须指定' })
    id!: string;
}
