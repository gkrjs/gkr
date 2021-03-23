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
import { CaptchaActionType, CaptchaType } from '../constants';
import { ReqUser } from '../decorators';
import {
    CredentialCaptchaMessageDto,
    CredentialDto,
    EmailLoginDto,
    EmailRegisterDto,
    EmailRetrievePasswordDto,
    LoginEmailCaptchaDto,
    LoginPhoneCaptchaDto,
    PhoneLoginDto,
    PhoneRegisterDto,
    PhoneRetrievePasswordDto,
    RegisterDto,
    RegisterEmailCaptchaDto,
    RegisterPhoneCaptchaDto,
    RetrievePasswordDto,
    RetrievePasswordEmailCaptchaDto,
    RetrievePasswordPhoneCaptchaDto,
} from '../dtos';
import { UserEntity } from '../entities';
import { JwtAuthGuard, LocalAuthGuard } from '../guards';
import { IsUserEnabled } from '../helpers';
import { AuthService, CaptchaService } from '../services';
import { UserModule } from '../user.module';

/**
 * 用户认证控制器
 *
 * @export
 * @class AuthController
 */
@Controller('auth')
@Depends(UserModule)
@ApiTags('用户操作')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly captchaService: CaptchaService,
    ) {}

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
    @APIEnabled(() => IsUserEnabled('LOGOUT'))
    @Post('logout')
    @UseGuards(JwtAuthGuard)
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
    @APIEnabled(() => IsUserEnabled('USERNAME_REGISTER'))
    @Post('register')
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
    @APIEnabled(() => IsUserEnabled('PHONE_REGISTER'))
    @Post('phone-register')
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
    @APIEnabled(() => IsUserEnabled('EMAIL_REGISTER'))
    @Post('email-register')
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
    @APIEnabled(() => IsUserEnabled('CREDENTIAL_RETRIEVE_PASSWORD'))
    @Patch('retrieve-password')
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
    @APIEnabled(() => IsUserEnabled('PHONE_RETRIEVE_PASSWORD'))
    @Patch('retrieve-password-sms')
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
    @APIEnabled(() => IsUserEnabled('EMAIL_RETRIEVE_PASSWORD'))
    @Patch('retrieve-password-email')
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

    /**
     * 发送登录验证码短信
     *
     * @param {LoginPhoneCaptchaDto} data
     * @return {*}
     * @memberof AuthController
     */
    @APIEnabled(() => IsUserEnabled('PHONE_LOGIN'))
    @Post('send-login-sms')
    async sendLoginSms(
        @Body()
        data: LoginPhoneCaptchaDto,
    ) {
        return this.captchaService.sendByCredential(
            { ...data, credential: data.phone },
            CaptchaActionType.LOGIN,
            CaptchaType.SMS,
        );
    }

    /**
     * 发送登录验证码邮件
     *
     * @param {LoginEmailCaptchaDto} data
     * @return {*}
     * @memberof AuthController
     */
    @APIEnabled(() => IsUserEnabled('EMAIL_LOGIN'))
    @Post('send-login-email')
    async sendLoginEmail(
        @Body()
        data: LoginEmailCaptchaDto,
    ) {
        return this.captchaService.sendByCredential(
            { ...data, credential: data.email },
            CaptchaActionType.LOGIN,
            CaptchaType.EMAIL,
        );
    }

    /**
     * 发送用户注册验证码短信
     *
     * @param {RegisterPhoneCaptchaDto} data
     * @return {*}
     * @memberof AuthController
     */
    @APIEnabled(() => IsUserEnabled('PHONE_REGISTER'))
    @Post('send-register-sms')
    async sendRegisterSms(
        @Body()
        data: RegisterPhoneCaptchaDto,
    ) {
        const { result } = await this.captchaService.send(
            data,
            CaptchaActionType.REGISTER,
            CaptchaType.SMS,
            undefined,
            'can not send sms for register user!',
        );
        return { result };
    }

    /**
     * 发送用户注册验证码邮件
     *
     * @param {RegisterEmailCaptchaDto} data
     * @return {*}
     * @memberof AuthController
     */
    @APIEnabled(() => IsUserEnabled('EMAIL_REGISTER'))
    @Post('send-register-email')
    async sendRegisterEmail(
        @Body()
        data: RegisterEmailCaptchaDto,
    ) {
        const { result } = await this.captchaService.send(
            data,
            CaptchaActionType.REGISTER,
            CaptchaType.EMAIL,
            undefined,
            'can not send email for register user!',
        );
        return { result };
    }

    /**
     * 发送找回密码的验证码短信
     *
     * @param {RetrievePasswordPhoneCaptchaDto} data
     * @return {*}
     * @memberof AuthController
     */
    @APIEnabled(() => IsUserEnabled('PHONE_RETRIEVE_PASSWORD'))
    @Post('send-retrieve-password-sms')
    async sendRetrievePasswordSms(
        @Body()
        data: RetrievePasswordPhoneCaptchaDto,
    ) {
        return this.captchaService.sendByType(
            data,
            CaptchaActionType.RETRIEVEPASSWORD,
            CaptchaType.SMS,
            'can not send sms for reset-password!',
        );
    }

    /**
     * 发送找回密码的验证码邮件
     *
     * @param {RetrievePasswordEmailCaptchaDto} data
     * @return {*}
     * @memberof AuthController
     */
    @APIEnabled(() => IsUserEnabled('EMAIL_RETRIEVE_PASSWORD'))
    @Post('send-retrieve-password-email')
    async sendRetrievePasswordEmail(
        @Body()
        data: RetrievePasswordEmailCaptchaDto,
    ) {
        return this.captchaService.sendByType(
            data,
            CaptchaActionType.RETRIEVEPASSWORD,
            CaptchaType.EMAIL,
            'can not send email for reset-password!',
        );
    }

    /**
     * 通过登录凭证找回密码时同时发送短信和邮件
     *
     * @param {CredentialCaptchaMessageDto} data
     * @return {*}
     * @memberof AuthController
     */
    @APIEnabled(() => IsUserEnabled('CREDENTIAL_RETRIEVE_PASSWORD'))
    @Post('send-retrieve-password')
    async sendRetrievePasswordCaptcha(
        @Body()
        data: CredentialCaptchaMessageDto,
    ) {
        return this.captchaService.sendByCredential(
            data,
            CaptchaActionType.RETRIEVEPASSWORD,
            undefined,
            'can not send sms or email for reset-password!',
        );
    }
}
