import { Configure, SmsUtil, TimeUtil } from '@/core';
import { InjectQueue } from '@nestjs/bull';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { classToPlain } from 'class-transformer';
import { Repository } from 'typeorm';
import {
    CaptchaActionType,
    CaptchaType,
    SEND_CAPTCHA_PROCESS,
    SEND_CAPTCHA_QUEUE,
} from '../constants';
import {
    CredentialCaptchaMessageDto,
    EmailCaptchaMessageDto,
    PhoneCaptchaMessageDto,
} from '../dtos';
import { CaptchaEntity, UserEntity } from '../entities';
import { generateCatpchaCode, getUserConfig } from '../helpers';
import { CaptchaOption, EmailCaptchaOption, SmsCaptchaOption } from '../types';
import { UserService } from './user.service';

/**
 * 验证码发送服务
 *
 * @export
 * @class CaptchaService
 */
@Injectable()
export class CaptchaService {
    constructor(
        @InjectRepository(CaptchaEntity)
        protected captchaRepository: Repository<CaptchaEntity>,
        @InjectQueue(SEND_CAPTCHA_QUEUE) protected captchaQueue: Queue,
        protected configure: Configure,
        protected timer: TimeUtil,
        protected userService: UserService,
        protected smsUtil: SmsUtil,
    ) {}

    /**
     * 根据消息类型(短信/邮件)发送验证码
     *
     * @param {(PhoneCaptchaMessageDto | EmailCaptchaMessageDto)} data
     * @param {CaptchaActionType} action
     * @param {CaptchaType} type
     * @param {string} [message]
     * @return {*}
     * @memberof CaptchaService
     */
    async sendByType(
        data: PhoneCaptchaMessageDto | EmailCaptchaMessageDto,
        action: CaptchaActionType,
        type: CaptchaType,
        message?: string,
    ) {
        const key = type === CaptchaType.SMS ? 'phone' : 'email';
        const conditional = { [key]: (data as any)[key] };
        const user = await this.userService.findOneByCondition(conditional);
        if (!user) {
            throw new BadRequestException(
                `user with ${key === 'phone' ? 'phone number' : 'email'} ${
                    (data as any)[key]
                } not exists`,
            );
        }
        return this.sendByUser(user, action, type, message);
    }

    /**
     * 通过登录凭证发送验证码
     *
     * @param {CredentialCaptchaMessageDto} { credential }
     * @param {CaptchaActionType} action
     * @param {CaptchaType} [type]
     * @param {string} [message]
     * @return {*}
     * @memberof CaptchaService
     */
    async sendByCredential(
        { credential }: CredentialCaptchaMessageDto,
        action: CaptchaActionType,
        type?: CaptchaType,
        message?: string,
    ) {
        const user = await this.userService.findOneByCredential(credential);
        if (!user) {
            throw new BadRequestException(`user ${credential} not exists`);
        }
        return this.sendByUser(user, action, type, message);
    }

    /**
     * 通过用户对象发送验证码
     *
     * @param {UserEntity} user
     * @param {CaptchaActionType} action
     * @param {CaptchaType} [type]
     * @param {string} [message]
     * @return {*}
     * @memberof CaptchaService
     */
    async sendByUser(
        user: UserEntity,
        action: CaptchaActionType,
        type?: CaptchaType,
        message?: string,
    ) {
        // 创建发送类型列表
        const types: CaptchaType[] = type
            ? [type]
            : [CaptchaType.SMS, CaptchaType.EMAIL];
        // 添加异步任务返回的结果
        const logs: Record<string, any> = {};
        // 运行结果
        const results: Record<string, boolean> = {};
        // 错误消息
        let error = message;
        if (!error) {
            if (types.length > 1) error = 'can not send sms or email for you!';
            else error = `can not send ${types[0]} for you!`;
        }
        // 遍历发送类型列表
        for (const stype of types) {
            const key = stype === CaptchaType.SMS ? 'phone' : 'email';
            const config = getUserConfig<SmsCaptchaOption | EmailCaptchaOption>(
                `captcha.${stype}.${action}`,
            );
            // 生成随机验证码
            const code = generateCatpchaCode();
            if (config.enabled && user[key]) {
                try {
                    const data = { [key]: user[key] } as {
                        [key in 'phone' | 'email']: string;
                    };
                    // 添加发送任务
                    const { result, log } = await this.send(
                        data,
                        action,
                        stype,
                        code,
                    );
                    results[key] = result;
                    logs[key] = log;
                } catch (err) {
                    throw new BadRequestException(err);
                }
            }
        }
        return results;
    }

    /**
     * 送短信或邮件验证码
     *
     * @param {(PhoneCaptchaMessageDto | EmailCaptchaMessageDto)} data
     * @param {CaptchaActionType} action
     * @param {CaptchaType} type
     * @param {string} [captchaCode]
     * @param {string} [message]
     * @return {*}  {Promise<{ result: boolean; log: any }>}
     * @memberof CaptchaService
     */
    async send(
        data: PhoneCaptchaMessageDto | EmailCaptchaMessageDto,
        action: CaptchaActionType,
        type: CaptchaType,
        captchaCode?: string,
        message?: string,
    ): Promise<{ result: boolean; log: any }> {
        let log: any;
        const result = true;
        const code = captchaCode ?? generateCatpchaCode();
        const error =
            message ??
            `send ${type === CaptchaType.SMS ? 'sms' : 'email'} captcha failed`;
        try {
            const config = getUserConfig<CaptchaOption>(
                `captcha.${type}.${action}`,
            );
            // 如果没有启用则400响应
            if (!config.enabled) throw new BadRequestException(error);
            // 创建验证码模型实例
            const captcha = await this.createCaptcha(
                data,
                action,
                type,
                config,
                code,
            );
            const expired = getUserConfig<number>(
                `captcha.${type}.${action}.expired`,
            );
            const isQcloud =
                action === CaptchaActionType.LOGIN &&
                this.smsUtil.getOption(this.smsUtil.default).type === 'QCLOUD';
            const otherVars = isQcloud
                ? { expired: Math.floor(expired / 60) }
                : {};
            // 加入异步发送任务
            await this.captchaQueue.add(SEND_CAPTCHA_PROCESS, {
                captcha: classToPlain(captcha),
                option: config,
                otherVars,
            });
        } catch (err) {
            throw new BadRequestException(err);
        }
        return { result, log };
    }

    /**
     * 创建验证码模型对象
     *
     * @protected
     * @param {(PhoneCaptchaMessageDto | EmailCaptchaMessageDto)} data
     * @param {CaptchaType} type
     * @param {CaptchaActionType} action
     * @param {CaptchaOption} config
     * @param {string} [code]
     * @return {*}
     * @memberof CaptchaService
     */
    protected async createCaptcha(
        data: PhoneCaptchaMessageDto | EmailCaptchaMessageDto,
        action: CaptchaActionType,
        type: CaptchaType,
        config: CaptchaOption,
        code?: string,
    ) {
        const value =
            type === CaptchaType.SMS
                ? (data as PhoneCaptchaMessageDto).phone
                : (data as EmailCaptchaMessageDto).email;
        // 查询验证码是否存在
        const captcha = await this.captchaRepository.findOne({
            value,
            type,
            action,
        });
        // 如果没有传入code参数,则生成一个随机验证码
        const captchaCode = code ?? generateCatpchaCode();
        // 如果不存在则创建一个新的模型对象并返回
        if (!captcha) {
            return this.captchaRepository.create({
                value,
                type,
                action,
                code: captchaCode,
            });
        }
        // 发送频率限制
        const now = this.timer.getTime();
        // 判断是否超过发送频率
        const canSend = now.isAfter(
            this.timer
                .getTime({ date: captcha.updated_at })
                .add(config.limit, 'second'),
        );
        if (!canSend) {
            throw new Error(`Can't repeat send in ${config.limit}s `);
        }
        // 改变当前模型对象的code字段为新的验证码
        captcha.code = captchaCode;
        return captcha;
    }
}
