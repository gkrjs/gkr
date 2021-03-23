import { decrypt, EnviromentType, environment, HashUtil, time } from '@/core';
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { FastifyRequest as Request } from 'fastify';
import { ExtractJwt } from 'passport-jwt';
import { Repository } from 'typeorm';
import { CaptchaActionType, CaptchaType } from '../constants';
import { RegisterDto } from '../dtos';
import { CaptchaEntity, UserEntity } from '../entities';
import { getUserConfig } from '../helpers';
import { UserRepository } from '../repositories';
import { CaptchaOption, CaptchaValidate, UserConfig } from '../types';
import { TokenService } from './token.service';
import { UserService } from './user.service';

/**
 * 用户认证服务
 *
 * @export
 * @class AuthService
 */
@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(CaptchaEntity)
        protected captchaRepository: Repository<CaptchaEntity>,
        protected readonly userRepository: UserRepository,
        protected readonly userService: UserService,
        protected readonly tokenService: TokenService,
        protected readonly hashUtil: HashUtil,
    ) {}

    /**
     * 使用账号密码登录用户
     *
     * @param {string} credential
     * @param {string} password
     * @return {*}
     * @memberof AuthService
     */
    async login(credential: string, password: string) {
        const user = await this.userService.findOneByCredential(
            credential,
            async (query) => query.addSelect('user.password'),
        );
        if (user && decrypt(password, user.password)) {
            return user;
        }
        return false;
    }

    /**
     * 用户手机号/邮箱+验证码登录用户
     *
     * @param {string} value
     * @param {string} code
     * @param {CaptchaType} type
     * @param {string} [message]
     * @return {*}
     * @memberof AuthService
     */
    async loginByCaptcha(
        value: string,
        code: string,
        type: CaptchaType,
        message?: string,
    ) {
        const checked = await this.checkCodeExpired(
            { value, code, type },
            CaptchaActionType.LOGIN,
        );
        if (!checked) {
            throw new BadRequestException(
                'captcha has been expired,cannot used to login',
            );
        }
        const conditional = CaptchaType.SMS
            ? { phone: value }
            : { email: value };
        const user = await this.userService.findOneByCondition(conditional);
        if (!user) {
            const error =
                message ??
                `your ${
                    type === CaptchaType.SMS ? 'phone number' : 'email'
                } or captcha code not correct`;
            throw new UnauthorizedException(error);
        }
        return user;
    }

    /**
     * 注销登录(即把access_token列入Redis黑名单)
     *
     * @param {Request} req
     * @return {*}
     * @memberof AuthService
     */
    async logout(req: Request) {
        const accessToken = ExtractJwt.fromAuthHeaderAsBearerToken()(
            req as any,
        );
        if (accessToken) {
            await this.tokenService.removeAccessToken(accessToken);
        }

        return {
            msg: 'logout_success',
        };
    }

    /**
     * 使用用户名密码注册用户
     *
     * @param {RegisterDto} data
     * @return {*}
     * @memberof AuthService
     */
    async register(data: RegisterDto) {
        const { username, nickname, password } = data;
        const user = new UserEntity();
        user.username = username;
        user.password = this.hashUtil.encry(password);
        if (nickname) user.nickname = nickname;
        user.actived = true;
        await user.save();
        return this.userService.findOneById(user.id);
    }

    /**
     * 通过验证码注册
     *
     * @param {CaptchaValidate<{ password?: string; type: CaptchaType }>} data
     * @return {*}
     * @memberof AuthService
     */
    async registerByCaptcha(
        data: CaptchaValidate<{ password?: string; type: CaptchaType }>,
    ) {
        const { value, password, type } = data;
        const checked = await this.checkCodeExpired(
            data,
            CaptchaActionType.REGISTER,
        );
        if (checked) {
            throw new BadRequestException(
                'captcha has been expired,cannot used to register',
            );
        }
        const user = new UserEntity();
        if (password) user.password = password;
        user.actived = true;
        if (type === CaptchaType.EMAIL) {
            user.email = value;
        } else if (type === CaptchaType.SMS) {
            user.phone = value;
        }
        // 储存用户
        await user.save();
        return this.userService.findOneById(user.id);
    }

    /**
     * 通过验证码重置密码
     *
     * @param {CaptchaValidate<{ password: string; type?: CaptchaType }>} data
     * @return {*}
     * @memberof AuthService
     */
    async retrievePassword(
        data: CaptchaValidate<{ password: string; type?: CaptchaType }>,
    ) {
        const { value, password, type } = data;
        const checked = await this.checkCodeExpired(
            data,
            CaptchaActionType.RESETPASSWORD,
        );
        if (checked) {
            throw new ForbiddenException(
                'captcha has been expired,cannot to used to retrieve password',
            );
        }
        let user: UserEntity | undefined;
        let error: string;
        if (!type) {
            user = await this.userService.findOneByCredential(value);
            error = `user not exists of credential ${value}`;
        } else {
            const conditional = CaptchaType.EMAIL
                ? { email: value }
                : { phone: value };
            user = await this.userService.findOneByCondition(conditional);
            error = `user not exists of ${
                CaptchaType.EMAIL ? 'email' : 'phone number'
            } ${value}`;
        }
        if (!user) {
            throw new ForbiddenException(error);
        }
        user.password = password;
        await this.userRepository.save(user);
        return this.userService.findOneById(user.id);
    }

    /**
     * 登录用户后生成新的token和refreshToken
     *
     * @param {UserEntity} user
     * @return {*}
     * @memberof AuthService
     */
    async createToken(user: UserEntity) {
        const now = time();
        const { accessToken } = await this.tokenService.generateAccessToken(
            user,
            now,
        );
        return accessToken.value;
    }

    /**
     * 检测验证码是否过期
     *
     * @protected
     * @param {CaptchaValidate<{ type?: CaptchaType }>} data
     * @param {CaptchaActionType} action
     * @return {*}
     * @memberof AuthService
     */
    protected async checkCodeExpired(
        data: CaptchaValidate<{ type?: CaptchaType }>,
        action: CaptchaActionType,
    ) {
        const { value, code, type } = data;
        const conditional: Record<string, any> = { code, value, action };
        if (type) conditional.type = type;
        const codeItem = await this.captchaRepository.findOne({
            where: conditional,
        });
        if (!codeItem) {
            throw new ForbiddenException('captcha code is not incorrect');
        }
        const { expired } = getUserConfig<CaptchaOption>(
            `captcha.${type}.${action}`,
        );
        return time({ date: codeItem.updated_at })
            .add(expired, 'second')
            .isAfter(time());
    }

    /**
     * 导入Jwt模块
     *
     * @static
     * @returns
     * @userof AuthService
     */
    static jwtModuleFactory() {
        return JwtModule.registerAsync({
            useFactory: () => {
                const config = getUserConfig<UserConfig['jwt']>('jwt');
                return {
                    secret: config.secret,
                    ignoreExpiration: environment() === EnviromentType.DEV,
                    signOptions: { expiresIn: `${config.token_expired}s` },
                };
            },
        });
    }
}
