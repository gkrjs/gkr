import { MailerUtil, MailSendParams, SmsUtil } from '@/core';
import { Process, Processor } from '@nestjs/bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bull';
import chalk from 'chalk';
import { omit } from 'lodash';
import { Repository } from 'typeorm';
import {
    CaptchaType,
    SEND_CAPTCHA_PROCESS,
    SEND_CAPTCHA_QUEUE,
} from '../constants';
import { CaptchaEntity } from '../entities';
import {
    EmailCaptchaOption,
    SendCaptchaQueueJob,
    SmsCaptchaOption,
} from '../types';

/**
 * 发送验证码的列队任务处理
 *
 * @export
 * @class SendCaptchaProcessor
 */
@Processor(SEND_CAPTCHA_QUEUE)
export class SendCaptchaProcessor {
    constructor(
        @InjectRepository(CaptchaEntity)
        private captchaRepository: Repository<CaptchaEntity>,
        private readonly mailer: MailerUtil,
        private readonly sms: SmsUtil,
    ) {}

    @Process(SEND_CAPTCHA_PROCESS)
    async sendHandler(job: Job<SendCaptchaQueueJob>) {
        return this.sendCode(job);
    }

    protected async sendCode(job: Job<SendCaptchaQueueJob>) {
        const { captcha } = job.data;
        try {
            if (captcha.type === CaptchaType.SMS) {
                await this.sendSms(job.data);
            } else if (captcha.type === CaptchaType.EMAIL) {
                await this.sendEmail(job.data);
            }
            return await this.captchaRepository.save(
                omit(captcha, ['created_at', 'updated_at']),
            );
        } catch (err) {
            console.log(chalk.red(err));
            throw new Error(err);
        }
    }

    protected async sendSms(data: SendCaptchaQueueJob) {
        const {
            captcha: { value, code },
            option,
            otherVars,
        } = data;
        const { template, driver } = option as SmsCaptchaOption;
        const result = await this.sms.send(
            {
                numbers: [value],
                template,
                vars: otherVars ? { code, ...otherVars } : { code },
            },
            driver,
        );
        return result;
    }

    protected async sendEmail(data: SendCaptchaQueueJob) {
        const {
            captcha: { action, value, code },
            option,
        } = data;
        const { template, driver, subject } = option as EmailCaptchaOption;
        return this.mailer.send<MailSendParams & { template?: string }>(
            {
                name: action,
                subject,
                template,
                html: !template,
                to: [value],
                vars: { code },
            },
            driver,
        );
    }
}
