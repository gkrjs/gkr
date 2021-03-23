import { APIEnabled, Depends } from '@/core';
import {
    Body,
    Controller,
    Patch,
    Post,
    Request,
    UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CaptchaType } from '../constants';
import { Guest, ReqUser } from '../decorators';
import {
    CredentialDto,
    EmailLoginDto,
    EmailRegisterDto,
    EmailRetrievePasswordDto,
    PhoneLoginDto,
    PhoneRegisterDto,
    PhoneRetrievePasswordDto,
    RegisterDto,
    RetrievePasswordDto,
} from '../dtos';
import { UserEntity } from '../entities';
import { LocalAuthGuard } from '../guards';
import { IsUserEnabled } from '../helpers';
import { AuthService, CaptchaService } from '../services';
import { UserModule } from '../user.module';
import { CaptchaController } from './captcha.controller';

/**
 * 用户认证控制器
 *
 * @export
 * @class AuthController
 */
@Controller('auth')
@Depends(UserModule)
@ApiTags('用户操作')
export class AuthController extends CaptchaController {
    constructor(
        protected readonly authService: AuthService,
        protected readonly captchaService: CaptchaService,
    ) {
        super(captchaService);
    }

    /**
     * 常规登录(凭证+密码)
     * 凭证为username/phone/email
     *
     * @param {UserEntity} user
     * @param {CredentialDto} _data
     * @return {*}
     * @memberof AuthController
     */
    @Post('login')
    @Guest()
    @UseGuards(LocalAuthGuard)
    async login(@ReqUser() user: UserEntity, @Body() _data: CredentialDto) {
        return { token: await this.authService.createToken(user) };
    }

    /**
     * 通过短信验证码登录
     *
     * @param {PhoneLoginDto} { phone, code }
     * @return {*}
     * @memberof AuthController
     */
    @APIEnabled(() => IsUserEnabled('PHONE_LOGIN'))
    @Post('phone-login')
    @Guest()
    async loginByPhone(@Body() { phone, code }: PhoneLoginDto) {
        const user = await this.authService.loginByCaptcha(
            phone,
            code,
            CaptchaType.SMS,
        );
        return { token: await this.authService.createToken(user) };
    }

    /**
     * 通过邮件验证码登录
     *
     * @param {EmailLoginDto} { email, code }
     * @return {*}
     * @memberof AuthController
     */
    @APIEnabled(() => IsUserEnabled('EMAIL_LOGIN'))
    @Post('email-login')
    @Guest()
    async loginByEmail(@Body() { email, code }: EmailLoginDto) {
        const user = await this.authService.loginByCaptcha(
            email,
            code,
            CaptchaType.EMAIL,
        );
        return { token: await this.authService.createToken(user) };
    }

    /**
     * 注销登录
     *
     * @param {*} req
     * @return {*}
     * @memberof AuthController
     */
    @Post('logout')
    @APIEnabled(() => IsUserEnabled('LOGOUT'))
    async logout(@Request() req: any) {
        return this.authService.logout(req);
    }

    /**
     * 使用用户名密码注册
     *
     * @param {RegisterDto} data
     * @return {*}
     * @memberof AuthController
     */
    @Post('register')
    @Guest()
    @APIEnabled(() => IsUserEnabled('USERNAME_REGISTER'))
    async register(
        @Body()
        data: RegisterDto,
    ) {
        return this.authService.register(data);
    }

    /**
     * 通过手机号验证注册用户
     *
     * @param {PhoneRegisterDto} data
     * @return {*}
     * @memberof AuthController
     */
    @Post('phone-register')
    @Guest()
    @APIEnabled(() => IsUserEnabled('PHONE_REGISTER'))
    async registerByPhone(
        @Body()
        data: PhoneRegisterDto,
    ) {
        return this.authService.registerByCaptcha({
            ...data,
            value: data.phone,
            type: CaptchaType.SMS,
        });
    }

    /**
     * 通过邮箱验证注册用户
     *
     * @param {EmailRegisterDto} data
     * @return {*}
     * @memberof AuthController
     */
    @Post('email-register')
    @Guest()
    @APIEnabled(() => IsUserEnabled('EMAIL_REGISTER'))
    async registerByEmail(
        @Body()
        data: EmailRegisterDto,
    ) {
        return this.authService.registerByCaptcha({
            ...data,
            value: data.email,
            type: CaptchaType.EMAIL,
        });
    }

    /**
     * 通过用户凭证(用户名,短信,邮件)发送邮件和短信验证码后找回密码
     *
     * @param {RetrievePasswordDto} data
     * @return {*}
     * @memberof AuthController
     */
    @Patch('retrieve-password')
    @Guest()
    @APIEnabled(() => IsUserEnabled('CREDENTIAL_RETRIEVE_PASSWORD'))
    async retrievePassword(
        @Body()
        data: RetrievePasswordDto,
    ) {
        return this.authService.retrievePassword({
            ...data,
            value: data.credential,
        });
    }

    /**
     * 通过短信验证码找回密码
     *
     * @param {PhoneRetrievePasswordDto} data
     * @return {*}
     * @memberof AuthController
     */
    @Patch('retrieve-password-sms')
    @Guest()
    @APIEnabled(() => IsUserEnabled('PHONE_RETRIEVE_PASSWORD'))
    async retrievePasswordByPhone(
        @Body()
        data: PhoneRetrievePasswordDto,
    ) {
        return this.authService.retrievePassword({
            ...data,
            value: data.phone,
            type: CaptchaType.SMS,
        });
    }

    /**
     * 通过邮件验证码找回密码
     *
     * @param {EmailRetrievePasswordDto} data
     * @return {*}
     * @memberof AuthController
     */
    @Patch('retrieve-password-email')
    @Guest()
    @APIEnabled(() => IsUserEnabled('EMAIL_RETRIEVE_PASSWORD'))
    async retrievePasswordByEmail(
        @Body()
        data: EmailRetrievePasswordDto,
    ) {
        return this.authService.retrievePassword({
            ...data,
            value: data.email,
            type: CaptchaType.EMAIL,
        });
    }
}
