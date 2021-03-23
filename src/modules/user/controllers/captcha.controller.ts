import { APIEnabled } from '@/core';
import { Body, Post } from '@nestjs/common';
import { CaptchaActionType, CaptchaType } from '../constants';
import { Guest, ReqUser } from '../decorators';
import {
    BoundEmailCaptchaDto,
    BoundPhoneCaptchaDto,
    CredentialCaptchaMessageDto,
    LoginEmailCaptchaDto,
    LoginPhoneCaptchaDto,
    RegisterEmailCaptchaDto,
    RegisterPhoneCaptchaDto,
    RetrievePasswordEmailCaptchaDto,
    RetrievePasswordPhoneCaptchaDto,
    UserCaptchaMessageDto,
} from '../dtos';
import { UserEntity } from '../entities';
import { IsUserEnabled } from '../helpers';
import { CaptchaService } from '../services';

/**
 * 发送用户验证码控制器
 *
 * @export
 * @abstract
 * @class CaptchaController
 */
export abstract class CaptchaController {
    constructor(protected readonly captchaService: CaptchaService) {}

    /**
     * 发送登录验证码短信
     *
     * @param {LoginPhoneCaptchaDto} data
     * @return {*}
     * @memberof CaptchaController
     */
    @Post('send-login-sms')
    @Guest()
    @APIEnabled(() => IsUserEnabled('PHONE_LOGIN'))
    async sendLoginSms(
        @Body()
        data: LoginPhoneCaptchaDto,
    ) {
        return this.captchaService.sendByCredential({
            ...data,
            credential: data.phone,
            action: CaptchaActionType.LOGIN,
            type: CaptchaType.SMS,
            checks: { phone: 'PHONE_LOGIN' },
        });
    }

    /**
     * 发送登录验证码邮件
     *
     * @param {LoginEmailCaptchaDto} data
     * @return {*}
     * @memberof CaptchaController
     */
    @Post('send-login-email')
    @Guest()
    @APIEnabled(() => IsUserEnabled('EMAIL_LOGIN'))
    async sendLoginEmail(
        @Body()
        data: LoginEmailCaptchaDto,
    ) {
        return this.captchaService.sendByCredential({
            ...data,
            credential: data.email,
            action: CaptchaActionType.LOGIN,
            type: CaptchaType.EMAIL,
            checks: { email: 'EMAIL_LOGIN' },
        });
    }

    /**
     * 发送用户注册验证码短信
     *
     * @param {RegisterPhoneCaptchaDto} data
     * @return {*}
     * @memberof CaptchaController
     */
    @Post('send-register-sms')
    @Guest()
    @APIEnabled(() => IsUserEnabled('PHONE_REGISTER'))
    async sendRegisterSms(
        @Body()
        data: RegisterPhoneCaptchaDto,
    ) {
        const { result } = await this.captchaService.send({
            data,
            action: CaptchaActionType.REGISTER,
            type: CaptchaType.SMS,
            checks: 'PHONE_REGISTER',
            message: 'can not send sms for register user!',
        });
        return { result };
    }

    /**
     * 发送用户注册验证码邮件
     *
     * @param {RegisterEmailCaptchaDto} data
     * @return {*}
     * @memberof CaptchaController
     */
    @Post('send-register-email')
    @Guest()
    @APIEnabled(() => IsUserEnabled('EMAIL_REGISTER'))
    async sendRegisterEmail(
        @Body()
        data: RegisterEmailCaptchaDto,
    ) {
        const { result } = await this.captchaService.send({
            data,
            action: CaptchaActionType.REGISTER,
            type: CaptchaType.EMAIL,
            checks: 'EMAIL_REGISTER',
            message: 'can not send email for register user!',
        });
        return { result };
    }

    /**
     * 发送找回密码的验证码短信
     *
     * @param {RetrievePasswordPhoneCaptchaDto} data
     * @return {*}
     * @memberof CaptchaController
     */
    @Post('send-retrieve-password-sms')
    @Guest()
    @APIEnabled(() => IsUserEnabled('PHONE_RETRIEVE_PASSWORD'))
    async sendRetrievePasswordSms(
        @Body()
        data: RetrievePasswordPhoneCaptchaDto,
    ) {
        return this.captchaService.sendByType({
            data,
            action: CaptchaActionType.RETRIEVEPASSWORD,
            type: CaptchaType.SMS,
            checks: { phone: 'PHONE_RETRIEVE_PASSWORD' },
            message: 'can not send sms for reset-password!',
        });
    }

    /**
     * 发送找回密码的验证码邮件
     *
     * @param {RetrievePasswordEmailCaptchaDto} data
     * @return {*}
     * @memberof CaptchaController
     */
    @Post('send-retrieve-password-email')
    @Guest()
    @APIEnabled(() => IsUserEnabled('EMAIL_RETRIEVE_PASSWORD'))
    async sendRetrievePasswordEmail(
        @Body()
        data: RetrievePasswordEmailCaptchaDto,
    ) {
        return this.captchaService.sendByType({
            data,
            action: CaptchaActionType.RETRIEVEPASSWORD,
            type: CaptchaType.EMAIL,
            checks: { email: 'EMAIL_RETRIEVE_PASSWORD' },
            message: 'can not send email for reset-password!',
        });
    }

    /**
     * 通过登录凭证找回密码时同时发送短信和邮件
     *
     * @param {CredentialCaptchaMessageDto} data
     * @return {*}
     * @memberof CaptchaController
     */
    @Post('send-retrieve-password')
    @Guest()
    @APIEnabled(() => IsUserEnabled('CREDENTIAL_RETRIEVE_PASSWORD'))
    async sendRetrievePasswordCaptcha(
        @Body()
        { credential }: CredentialCaptchaMessageDto,
    ) {
        return this.captchaService.sendByCredential({
            credential,
            action: CaptchaActionType.RETRIEVEPASSWORD,
            checks: {
                phone: 'PHONE_RETRIEVE_PASSWORD',
                email: 'EMAIL_RETRIEVE_PASSWORD',
            },
            message: 'can not send sms or email for reset-password!',
        });
    }

    /**
     * 发送手机绑定验证码
     *
     * @param {BoundPhoneCaptchaDto} data
     * @return {*}
     * @memberof CaptchaController
     */
    @Post('send-phone-bound')
    @APIEnabled(() => IsUserEnabled('BOUND_PHONE'))
    async sendBoundPhone(@Body() data: BoundPhoneCaptchaDto) {
        return this.captchaService.sendByType({
            data,
            action: CaptchaActionType.ACCOUNTBOUND,
            type: CaptchaType.SMS,
            checks: {
                phone: 'BOUND_PHONE',
            },
            message: 'can not send sms for bind phone',
        });
    }

    /**
     * 发送邮件绑定验证码
     *
     * @param {BoundEmailCaptchaDto} data
     * @return {*}
     * @memberof CaptchaController
     */
    @Post('send-email-bound')
    @APIEnabled(() => IsUserEnabled('BOUND_EMAIL'))
    async sendEmailBound(@Body() data: BoundEmailCaptchaDto) {
        return this.captchaService.sendByType({
            data,
            action: CaptchaActionType.ACCOUNTBOUND,
            type: CaptchaType.EMAIL,
            checks: {
                email: 'BOUND_EMAIL',
            },
            message: 'can not send email for bind',
        });
    }

    /**
     * 发送原手机或原邮箱验证码
     *
     * @param {UserEntity} user
     * @param {UserCaptchaMessageDto} { type }
     * @return {*}
     * @memberof CaptchaController
     */
    @Post('send-old-bound')
    @APIEnabled(() => IsUserEnabled(['BOUND_PHONE', 'BOUND_EMAIL']))
    async sendOldBoundCaptcha(
        @ReqUser() user: UserEntity,
        @Body() { type }: UserCaptchaMessageDto,
    ) {
        return this.captchaService.sendByUser({
            user,
            action: CaptchaActionType.ACCOUNTBOUND,
            type,
            checks: {
                phone: 'BOUND_EMAIL',
                email: 'BOUND_EMAIL',
            },
            message: `can not send sms or email for bind ${
                type === CaptchaType.SMS ? 'phone number' : 'email'
            }!`,
        });
    }
}
