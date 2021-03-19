import { DtoValidation } from '@/core';
import { PickType } from '@nestjs/swagger';
import { CaptchaDtoGroups, UserDtoGroups } from '../constants';
import { GuestDto } from './guest.dto';

/**
 * 用户正常方式登录
 * @export
 * @class CredentialDto
 * @extends {PickType(GuestDto, [
 *     'credential',
 *     'password',
 * ])}
 */
export class CredentialDto extends PickType(GuestDto, [
    'credential',
    'password',
]) {}

/**
 * 通过手机验证码登录
 *
 * @export
 * @class PhoneLoginDto
 * @extends {PickType(GuestDto, [
 *     'phone',
 *     'code',
 * ] as const)}
 */
@DtoValidation({ groups: [CaptchaDtoGroups.PHONE_LOGIN] })
export class PhoneLoginDto extends PickType(GuestDto, [
    'phone',
    'code',
] as const) {}

/**
 * 通过邮箱验证码登录
 *
 * @export
 * @class EmailLoginDto
 * @extends {PickType(GuestDto, [
 *     'email',
 *     'code',
 * ] as const)}
 */
@DtoValidation({ groups: [CaptchaDtoGroups.EMAIL_LOGIN] })
export class EmailLoginDto extends PickType(GuestDto, [
    'email',
    'code',
] as const) {}

/**
 * 普通方式注册用户
 *
 * @export
 * @class RegisterDto
 * @extends {PickType(GuestDto, [
 *     'username',
 *     'nickname',
 *     'password',
 *     'plainPassword',
 * ] as const)}
 */
@DtoValidation({ groups: [UserDtoGroups.REGISTER] })
export class RegisterDto extends PickType(GuestDto, [
    'username',
    'nickname',
    'password',
    'plainPassword',
] as const) {}

/**
 * 通过手机验证码注册
 *
 * @export
 * @class PhoneRegisterDto
 * @extends {PickType(GuestDto, [
 *     'phone',
 *     'code',
 * ] as const)}
 */
@DtoValidation({ groups: [CaptchaDtoGroups.PHONE_REGISTER] })
export class PhoneRegisterDto extends PickType(GuestDto, [
    'phone',
    'code',
] as const) {}

/**
 * 通过邮件验证码注册
 *
 * @export
 * @class EmailRegisterDto
 * @extends {PickType(GuestDto, [
 *     'email',
 *     'code',
 * ] as const)}
 */
@DtoValidation({ groups: [CaptchaDtoGroups.EMAIL_REGISTER] })
export class EmailRegisterDto extends PickType(GuestDto, [
    'email',
    'code',
] as const) {}

/**
 * 通过登录凭证找回密码
 *
 * @export
 * @class RetrievePasswordDto
 * @extends {PickType(GuestDto, [
 *     'credential',
 *     'code',
 *     'password',
 *     'plainPassword',
 * ] as const)}
 */
export class RetrievePasswordDto extends PickType(GuestDto, [
    'credential',
    'code',
    'password',
    'plainPassword',
] as const) {}

/**
 * 通过手机号找回密码
 *
 * @export
 * @class PhoneRetrievePasswordDto
 * @extends {PickType(GuestDto, [
 *     'phone',
 *     'code',
 *     'password',
 *     'plainPassword',
 * ] as const)}
 */
@DtoValidation({ groups: [CaptchaDtoGroups.EMAIL_RETRIEVE_PASSWORD] })
export class PhoneRetrievePasswordDto extends PickType(GuestDto, [
    'phone',
    'code',
    'password',
    'plainPassword',
] as const) {}

/**
 * 通过邮箱地址找回密码
 *
 * @export
 * @class EmailRetrievePasswordDto
 * @extends {PickType(GuestDto, [
 *     'email',
 *     'code',
 *     'password',
 *     'plainPassword',
 * ] as const)}
 */
@DtoValidation({ groups: [CaptchaDtoGroups.EMAIL_RETRIEVE_PASSWORD] })
export class EmailRetrievePasswordDto extends PickType(GuestDto, [
    'email',
    'code',
    'password',
    'plainPassword',
] as const) {}
