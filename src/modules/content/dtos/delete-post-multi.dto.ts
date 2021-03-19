import { DtoValidation, IsModelExist } from '@/core';
import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsUUID } from 'class-validator';
import { getManager } from 'typeorm';
import { PostEntity } from '../entities';
import { PostRepository } from '../repositories';
import { DeletePostDto } from './delete-post.dto';

/**
 * 文章列表查询数据验证
 *
 * @export
 * @class QueryPostDto
 */
@Injectable()
@DtoValidation({ groups: ['delete-multi'] })
export class DeletePostMultiDto extends DeletePostDto {
    @ApiProperty({ description: '文章UUID列表', type: [String] })
    @IsModelExist(PostEntity, {
        each: true,
        message: '指定的文章不存在',
        groups: ['delete-multi'],
    })
    @IsUUID(undefined, {
        each: true,
        message: '文章ID格式错误',
        groups: ['delete-multi'],
    })
    @IsDefined({
        each: true,
        groups: ['delete-multi'],
        message: '文章ID必须指定',
    })
    posts: PostEntity[] = [];

    async transform(obj: DeletePostMultiDto) {
        const em = getManager();
        obj.posts = await em
            .getCustomRepository(PostRepository)
            .findByIds(obj.posts);
        return obj;
    }
}
