import { DtoValidation } from '@/core';
import { Injectable } from '@nestjs/common';
import { ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { UserDtoGroups } from '../../constants';
import { GuestDto } from '../guest.dto';

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
@Injectable()
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
