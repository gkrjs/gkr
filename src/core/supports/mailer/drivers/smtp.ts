import Email from 'email-templates';
import { pick } from 'lodash';
import mailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import SMTPConnection from 'nodemailer/lib/smtp-connection';
import path from 'path';
import { MailerOptions, SmtpMailParams } from '../types';
import { BaseMailer } from './base';

type DriverConfig = MailerOptions['SMTP'];
/**
 * SMTP驱动
 *
 * @export
 * @class SmtpMailer
 * @extends {BaseMailer<DriverConfig, Mail, SmtpMailParams>}
 */
export class SmtpMailer extends BaseMailer<DriverConfig, Mail, SmtpMailParams> {
    /**
     * 创建NodeMailer客户端
     *
     * @protected
     * @param {DriverConfig} config
     * @return {*}
     * @memberof SmtpMailer
     */
    protected makeClient(config: DriverConfig) {
        const configd: SMTPConnection.Options = {
            host: config.host,
            secure: config.secure ?? false, // true for 465, false for other ports
            auth: {
                user: config.user, // generated ethereal user
                pass: config.password, // generated ethereal password
            },
        };
        if (!configd.secure) configd.port = config.port ?? 25;
        return mailer.createTransport(configd);
    }

    /**
     * 通过SMTP发送邮件
     *
     * @param {Mail} client
     * @param {SmtpMailParams} options
     * @param {DriverConfig} config
     * @return {*}
     * @memberof SmtpMailer
     */
    protected async makeSend(
        client: Mail,
        options: SmtpMailParams,
        config: DriverConfig,
    ) {
        const tplPath = path.resolve(config.resource, options.name ?? 'custom');
        const textOnly = !options.html && options.text;
        const noHtmlToText = options.html && options.text;
        const configd: Email.EmailConfig = {
            preview: options.preview ?? false,
            send: !options.preview,
            message: { from: options.from ?? config.from ?? config.user },
            transport: client,
            subjectPrefix: options.subjectPrefix,
            textOnly,
            juiceResources: {
                preserveImportant: true,
                webResources: {
                    relativeTo: tplPath,
                },
            },
        };
        if (noHtmlToText) configd.htmlToText = false;
        const email = new Email(configd);
        const message = {
            ...pick(options, ['from', 'to', 'reply', 'attachments', 'subject']),
            locals: options.vars,
        };
        return email.send({
            template: tplPath,
            message,
        });
    }
}
