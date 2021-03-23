import { APIEnabled, Depends } from '@/core';
import { Body, Controller, Get, Patch, SerializeOptions } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CaptchaType } from '../constants';
import { ReqUser } from '../decorators';
import {
    EmailBoundDto,
    PhoneBoundDto,
    UpdateInfoDto,
    UpdatePassword,
} from '../dtos';
import { UserEntity } from '../entities';
import { IsUserEnabled } from '../helpers';
import { AccountService, CaptchaService, UserService } from '../services';
import { UserModule } from '../user.module';
import { CaptchaController } from './captcha.controller';

/**
 * 账户中心控制器
 *
 * @export
 * @class AccountController
 * @extends {CaptchaController}
 */
@Controller('account')
@Depends(UserModule)
@ApiTags('账户信息')
export class AccountController extends CaptchaController {
    constructor(
        protected readonly captchaService: CaptchaService,
        protected readonly userService: UserService,
        protected readonly accountService: AccountService,
    ) {
        super(captchaService);
    }

    /**
     * 获取用户个人信息
     *
     * @param {UserEntity} user
     * @return {*}
     * @memberof AccountController
     */
    @Get()
    @APIEnabled(() => IsUserEnabled('GET_INFO'))
    @SerializeOptions({
        groups: ['user-item'],
    })
    async getInfo(@ReqUser() user: UserEntity) {
        return this.userService.findOneById(user.id);
    }

    /**
     * 更新账户信息
     *
     * @param {UserEntity} user
     * @param {UpdateInfoDto} data
     * @return {*}
     * @memberof AccountController
     */
    @Patch()
    @APIEnabled(() => IsUserEnabled('UPDATE_INFO'))
    @SerializeOptions({
        groups: ['user-item'],
    })
    async updateInfo(
        @ReqUser() user: UserEntity,
        @Body()
        data: UpdateInfoDto,
    ) {
        return this.userService.update({ id: user.id, ...data });
    }

    /**
     * 更改密码
     *
     * @param {UserEntity} user
     * @param {UpdatePassword} data
     * @return {*}  {Promise<UserEntity>}
     * @memberof AccountController
     */
    @Patch('reset-passowrd')
    @APIEnabled(() => IsUserEnabled('ACCOUNT_RESET_PASSWORD'))
    @SerializeOptions({
        groups: ['user-item'],
    })
    async resetPassword(
        @ReqUser() user: UserEntity,
        @Body() data: UpdatePassword,
    ): Promise<UserEntity> {
        return this.userService.updatePassword(user, data);
    }

    /**
     * 绑定或更改手机号
     *
     * @param {UserEntity} user
     * @param {PhoneBoundDto} data
     * @return {*}  {Promise<UserEntity>}
     * @memberof AccountController
     */
    @Patch('bound-phone')
    @APIEnabled(() => IsUserEnabled('BOUND_PHONE'))
    @SerializeOptions({
        groups: ['user-item'],
    })
    async boundPhone(
        @ReqUser() user: UserEntity,
        @Body() data: PhoneBoundDto,
    ): Promise<UserEntity> {
        return this.accountService.boundCaptcha(user, {
            ...data,
            type: CaptchaType.SMS,
            value: data.phone,
        });
    }

    /**
     * 绑定或更改邮箱
     *
     * @param {UserEntity} user
     * @param {EmailBoundDto} data
     * @return {*}  {Promise<UserEntity>}
     * @memberof AccountController
     */
    @Patch('bound-email')
    @APIEnabled(() => IsUserEnabled('BOUND_EMAIL'))
    @SerializeOptions({
        groups: ['user-item'],
    })
    async boundEmail(
        @ReqUser() user: UserEntity,
        @Body() data: EmailBoundDto,
    ): Promise<UserEntity> {
        return this.accountService.boundCaptcha(user, {
            ...data,
            type: CaptchaType.EMAIL,
            value: data.email,
        });
    }
}
