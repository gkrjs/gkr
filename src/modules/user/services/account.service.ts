import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CaptchaActionType, CaptchaType } from '../constants';
import { CaptchaEntity, UserEntity } from '../entities';
import { UserRepository } from '../repositories';
import { CaptchaValidate } from '../types';
import { UserService } from './user.service';

@Injectable()
export class AccountService {
    constructor(
        @InjectRepository(CaptchaEntity)
        protected captchaRepository: Repository<CaptchaEntity>,
        protected userRepository: UserRepository,
        protected userService: UserService,
    ) {}

    /**
     * 绑定或更改手机号/邮箱
     *
     * @param {UserEntity} user
     * @param {CaptchaValidate<{ oldCode?: string; type: CaptchaType }>} data
     * @return {*}
     * @memberof AccountService
     */
    async boundCaptcha(
        user: UserEntity,
        data: CaptchaValidate<{ oldCode?: string; type: CaptchaType }>,
    ) {
        const { code, oldCode, value, type } = data;
        const key = type === CaptchaType.SMS ? 'phone' : 'email';
        const oldValue = user[key];
        const error: Record<string, { code: number; message: string }> = {
            'old-phone': {
                code: 1001,
                message: 'old phone captcha code is error',
            },
            phone: {
                code: 1002,
                message: 'new phone captcha code is error',
            },
            'old-email': {
                code: 2001,
                message: 'old email captcha code is error',
            },
            email: {
                code: 2002,
                message: 'new email captcha code is error',
            },
        };

        if (oldValue) {
            const oldCaptcha = await this.captchaRepository.findOne({
                type,
                value: oldValue,
                action: CaptchaActionType.ACCOUNTBOUND,
            });
            if (!oldCaptcha || oldCaptcha.code !== oldCode) {
                throw new ForbiddenException(error[`old-${key}`]);
            }
        }
        const captcha = await this.captchaRepository.findOne({
            code,
            type,
            value,
            action: CaptchaActionType.ACCOUNTBOUND,
        });
        if (!captcha) {
            throw new ForbiddenException(error[key]);
        }
        user[key] = value;
        await this.userRepository.save(user);
        return this.userService.findOneById(user.id);
    }
}
