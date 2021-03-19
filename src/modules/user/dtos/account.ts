import { DtoValidation } from '@/core';
import {
    ApiProperty,
    ApiPropertyOptional,
    OmitType,
    PickType,
} from '@nestjs/swagger';
import { IsNumberString, IsOptional, Length } from 'class-validator';
import { CaptchaDtoGroups, UserDtoGroups } from '../constants';
import { GuestDto } from './guest.dto';

/**
 * 对手机/邮箱绑定验证码进行验证
 *
 * @export
 * @class AccountBoundDto
 * @extends {PickType(GuestDto, [
 *     'code',
 *     'phone',
 *     'email',
 * ])}
 */
export class AccountBoundDto extends PickType(GuestDto, [
    'code',
    'phone',
    'email',
]) {
    @ApiPropertyOptional({ description: '旧账号验证码' })
    @IsNumberString(undefined, { message: '验证码必须为数字', always: true })
    @Length(6, 6, { message: '验证码长度错误', always: true })
    @IsOptional({ always: true })
    readonly oldCode?: string;
}

/**
 * 绑定或更改手机号验证
 *
 * @export
 * @class PhoneBoundDto
 * @extends {OmitType(AccountBoundDto, [
 *     'email',
 * ] as const)}
 */
@DtoValidation({ groups: [CaptchaDtoGroups.BOUND_PHONE] })
export class PhoneBoundDto extends OmitType(AccountBoundDto, [
    'email',
] as const) {}

/**
 * 绑定或更改邮箱验证
 *
 * @export
 * @class EmailBoundDto
 * @extends {OmitType(AccountBoundDto, ['phone'] as const)}
 */
@DtoValidation({ groups: [CaptchaDtoGroups.BOUND_EMAIL] })
export class EmailBoundDto extends OmitType(AccountBoundDto, [
    'phone',
] as const) {}

/**
 * 更新用户信息
 *
 * @export
 * @class UpdateInfoDto
 * @extends {PickType(GuestDto, [
 *     'username',
 *     'nickname',
 * ])}
 */
@DtoValidation({ groups: [UserDtoGroups.BOUND] })
export class UpdateInfoDto extends PickType(GuestDto, [
    'username',
    'nickname',
]) {}

/**
 * 更改用户密码
 *
 * @export
 * @class UpdatePassword
 * @extends {PickType(GuestDto, [
 *     'password',
 *     'plainPassword',
 * ])}
 */
export class UpdatePassword extends PickType(GuestDto, [
    'password',
    'plainPassword',
]) {
    @ApiProperty({
        description: '旧密码',
    })
    @Length(8, 50, {
        message: '密码长度至少为$constraint1个字符',
    })
    oldPassword!: string;
}
