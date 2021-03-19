import { DtoValidation } from '@/core';
import { PickType } from '@nestjs/swagger';
import { CaptchaDtoGroups } from '../constants';
import { GuestDto } from './guest.dto';

/**
 * 发送邮件或短信验证码消息
 *
 * @export
 * @class CaptchaMessage
 * @extends {PickType(GuestDto, ['phone', 'email'])}
 */
export class CaptchaMessage extends PickType(GuestDto, ['phone', 'email']) {}

/**
 * 发送短信验证码DTO类型
 *
 * @export
 * @class PhoneCaptchaMessageDto
 * @extends {PickType(CaptchaMessage, [
 *     'phone',
 * ] as const)}
 */
export class PhoneCaptchaMessageDto extends PickType(CaptchaMessage, [
    'phone',
] as const) {}

/**
 * 发送邮件验证码DTO类型
 *
 * @export
 * @class EmailCaptchaMessageDto
 * @extends {PickType(CaptchaMessage, [
 *     'email',
 * ] as const)}
 */
export class EmailCaptchaMessageDto extends PickType(CaptchaMessage, [
    'email',
] as const) {}

/**
 * 通过已登录账户发送验证码消息
 *
 * @export
 * @class UserCaptchaMessageDto
 * @extends {PickType(GuestDto, ['type'])}
 */
export class UserCaptchaMessageDto extends PickType(GuestDto, ['type']) {}

/**
 * 通过用户凭证发送验证码消息
 *
 * @export
 * @class CredentialCaptchaMessageDto
 * @extends {PickType(GuestDto, [
 *     'credential',
 * ])}
 */
export class CredentialCaptchaMessageDto extends PickType(GuestDto, [
    'credential',
]) {}

/**
 * 发送登录验证码短信
 *
 * @export
 * @class LoginPhoneCaptchaDto
 * @extends {PhoneCaptchaMessageDto}
 */
@DtoValidation({ groups: [CaptchaDtoGroups.PHONE_LOGIN] })
export class LoginPhoneCaptchaDto extends PhoneCaptchaMessageDto {}

/**
 * 发送登录验证码邮件
 *
 * @export
 * @class LoginEmailCaptchaDto
 * @extends {EmailCaptchaMessageDto}
 */
@DtoValidation({ groups: [CaptchaDtoGroups.EMAIL_LOGIN] })
export class LoginEmailCaptchaDto extends EmailCaptchaMessageDto {}

/**
 * 发送注册验证码短信
 *
 * @export
 * @class RegisterPhoneCaptchaDto
 * @extends {PhoneCaptchaMessageDto}
 */
@DtoValidation({ groups: [CaptchaDtoGroups.PHONE_REGISTER] })
export class RegisterPhoneCaptchaDto extends PhoneCaptchaMessageDto {}

/**
 * 发送注册验证码邮件
 *
 * @export
 * @class RegisterEmailCaptchaDto
 * @extends {EmailCaptchaMessageDto}
 */
@DtoValidation({ groups: [CaptchaDtoGroups.PHONE_REGISTER] })
export class RegisterEmailCaptchaDto extends EmailCaptchaMessageDto {}

/**
 * 发送找回密码短信
 *
 * @export
 * @class RetrievePasswordPhoneCaptchaDto
 * @extends {PhoneCaptchaMessageDto}
 */
@DtoValidation({ groups: [CaptchaDtoGroups.EMAIL_RETRIEVE_PASSWORD] })
export class RetrievePasswordPhoneCaptchaDto extends PhoneCaptchaMessageDto {}

/**
 * 发送找回密码邮件
 *
 * @export
 * @class RetrievePasswordEmailCaptchaDto
 * @extends {EmailCaptchaMessageDto}
 */
@DtoValidation({ groups: [CaptchaDtoGroups.EMAIL_RETRIEVE_PASSWORD] })
export class RetrievePasswordEmailCaptchaDto extends EmailCaptchaMessageDto {}

/**
 * 发送手机绑定短信
 *
 * @export
 * @class BoundPhoneCaptchaDto
 * @extends {PhoneCaptchaMessageDto}
 */
@DtoValidation({ groups: [CaptchaDtoGroups.BOUND_PHONE] })
export class BoundPhoneCaptchaDto extends PhoneCaptchaMessageDto {}

/**
 * 发送邮箱绑定邮件
 *
 * @export
 * @class BoundEmailCaptchaDto
 * @extends {EmailCaptchaMessageDto}
 */
@DtoValidation({ groups: [CaptchaDtoGroups.BOUND_EMAIL] })
export class BoundEmailCaptchaDto extends EmailCaptchaMessageDto {}
