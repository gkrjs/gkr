import { DtoValidation, IsModelExist, PartialDto, tBoolean } from '@/core';
import { Injectable } from '@nestjs/common';
import { ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsBoolean,
    IsEnum,
    IsNumber,
    IsOptional,
    IsUUID,
} from 'class-validator';
import { getManager } from 'typeorm';
import { UserDtoGroups, UserOrderType } from '../constants';
import { UserEntity } from '../entities';
import { UserRepository } from '../repositories';
import { GuestDto } from './guest.dto';

/**
 * 创建用的请求数据验证
 *
 * @export
 * @class CreateUserDto
 * @extends {PickType(GuestDto, [
 *     'username',
 *     'nickname',
 *     'password',
 *     'phone',
 *     'email',
 * ])}
 */
@DtoValidation({ groups: [UserDtoGroups.CREATE] })
export class CreateUserDto extends PickType(GuestDto, [
    'username',
    'nickname',
    'password',
    'phone',
    'email',
]) {
    @ApiPropertyOptional({ description: '是否激活', default: true })
    @IsBoolean({ always: true, message: 'actived必须为布尔值' })
    @IsOptional({ always: true })
    actived?: boolean;
}

/**
 * 更新用户
 *
 * @export
 * @class UpdateUserDto
 * @extends {PartialDto(CreateUserDto)}
 */
export class UpdateUserDto extends PartialDto(CreateUserDto) {
    @IsModelExist(UserEntity, {
        groups: ['update'],
        message: '用户 $value 不存在',
    })
    @IsUUID(undefined, { groups: ['update'], message: '用户ID格式不正确' })
    id!: string;
}

/**
 * 删除用户
 *
 * @export
 * @class DeleteUserDto
 * @extends {PickType(GuestDto, ['trash'])}
 */
export class DeleteUserDto extends PickType(GuestDto, ['trash']) {}

/**
 * 删除多个用户
 *
 * @export
 * @class DeleteUserMultiDto
 * @extends {PickType(GuestDto, ['trash', 'users'])}
 */
@DtoValidation({ groups: [UserDtoGroups.DELETE_MULTIE] })
export class DeleteUserMultiDto extends PickType(GuestDto, ['trash', 'users']) {
    async transform(obj: DeleteUserMultiDto) {
        const em = getManager();
        obj.users = await em
            .getCustomRepository(UserRepository)
            .findByIds(obj.users);
        return obj;
    }
}

/**
 * 查询用户列表的Query数据验证
 *
 * @export
 * @class QueryUserDto
 */
@Injectable()
@DtoValidation({
    type: 'query',
    skipMissingProperties: true,
})
export class QueryUserDto {
    /**
     * 过滤激活状态
     *
     * @type {boolean}
     * @memberof QueryUserDto
     */
    @ApiPropertyOptional({
        description: '根据激活状态筛选',
    })
    @Transform(({ value }) => JSON.parse(value.toLowerCase()))
    @IsBoolean()
    actived?: boolean;

    /**
     * 排序规则
     *
     * @type {UserOrderType}
     * @memberof QueryUserDto
     */
    @ApiPropertyOptional({
        description: '排序规则',
        enum: UserOrderType,
    })
    @IsEnum(UserOrderType)
    orderBy?: UserOrderType;

    @ApiPropertyOptional({ description: '查看回收站', default: false })
    @Transform(({ value }) => (value ? tBoolean(value) : undefined))
    @IsBoolean()
    @IsOptional()
    trashed?: boolean;

    /**
     * 当前分页
     *
     * @memberof QueryUserDto
     */
    @ApiPropertyOptional({
        description: '当前页',
        default: 1,
    })
    @Transform((value) => Number(value))
    @IsNumber()
    page = 1;

    /**
     * 每页显示数据量
     *
     * @memberof QueryUserDto
     */
    @ApiPropertyOptional({
        description: '每页显示数量',
        default: 10,
    })
    @Transform((value) => Number(value))
    @IsNumber()
    limit = 10;
}
