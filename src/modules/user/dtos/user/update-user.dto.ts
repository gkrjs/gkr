import { IsModelExist, PartialDto } from '@/core';
import { Injectable } from '@nestjs/common';
import { IsUUID } from 'class-validator';
import { UserEntity } from '../../entities';
import { CreateUserDto } from './create-user.dto';

/**
 * 更新用户的请求数据验证
 *
 * @export
 * @class UpdateUserDto
 * @extends {PartialDto(CreateUserDto)}
 */
@Injectable()
export class UpdateUserDto extends PartialDto(CreateUserDto) {
    @IsModelExist(UserEntity, {
        groups: ['update'],
        message: '用户 $value 不存在',
    })
    @IsUUID(undefined, { groups: ['update'], message: '用户ID格式不正确' })
    id!: string;
}
