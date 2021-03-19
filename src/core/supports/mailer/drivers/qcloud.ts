import Email from 'email-templates';
import { pick } from 'lodash';
import path from 'path';
import * as tencentcloud from 'tencentcloud-sdk-nodejs';
import { SendEmailRequest } from 'tencentcloud-sdk-nodejs/tencentcloud/services/ses/v20201002/ses_models';
import { tNumber } from '../../../common';
import { MailerOptions, QcloudMailParams } from '../types';
import { BaseMailer } from './base';

const SesClient = tencentcloud.ses.v20201002.Client;
type DriverConfig = MailerOptions['QCLOUD'];
type Client = InstanceType<typeof SesClient>;

/**
 * 腾讯云邮件推送驱动
 *
 * @export
 * @class QcloudMailer
 * @extends {BaseMailer<DriverConfig, Client, QcloudMailParams>}
 */
export class QcloudMailer extends BaseMailer<
    DriverConfig,
    Client,
    QcloudMailParams
> {
    /**
     * 创建客户端
     *
     * @protected
     * @param {DriverConfig} config
     * @return {*}
     * @memberof QcloudMailer
     */
    protected makeClient(config: DriverConfig) {
        console.log(config);
        return new SesClient({
            credential: pick(config, ['secretId', 'secretKey']),
            region: config.region ?? 'ap-hongkong',
            profile: {
                httpProfile: {
                    endpoint: config.endpoint ?? 'ses.tencentcloudapi.com',
                },
            },
        });
    }

    /**
     * 发送邮件
     *
     * @protected
     * @param {Client} client
     * @param {QcloudMailParams} options
     * @param {DriverConfig} config
     * @return {*}
     * @memberof QcloudMailer
     */
    protected async makeSend(
        client: Client,
        options: QcloudMailParams,
        config: DriverConfig,
    ) {
        return client.SendEmail(await this.transParams(options, config));
    }

    /**
     * 转义通用配置参数为腾讯云短信发送参数
     *
     * @protected
     * @param {QcloudMailParams} options
     * @param {DriverConfig} config
     * @return {*}
     * @memberof QcloudMailer
     */
    protected async transParams(
        options: QcloudMailParams,
        config: DriverConfig,
    ) {
        let email: Email;
        let resourcePath: string;
        if (options.html || options.text || !options.subject) {
            if (!config.resource) {
                throw new Error(
                    'Email resource path must been specify if html or text of options enabled',
                );
            }
            resourcePath = path.resolve(
                config.resource!,
                options.name ?? 'custom',
            );
            email = new Email();
        }
        const params: SendEmailRequest = {
            FromEmailAddress: options.from ?? config.from,
            Destination:
                typeof options.to === 'string' ? [options.to] : options.to,
            Subject: 'no subject',
            ReplyToAddresses: options.reply,
        };
        if (options.template) {
            params.Template = {
                TemplateID: tNumber(options.template)!,
                TemplateData: JSON.stringify(options.vars ?? {}),
            };
        } else if (options.html || options.text) {
            params.Simple = {};
            if (options.html) {
                const content = await email!.render(
                    {
                        path: `${resourcePath!}/html`,
                        juiceResources: {
                            preserveImportant: true,
                            webResources: {
                                relativeTo: resourcePath!,
                            },
                        },
                    },
                    options.vars ?? {},
                );
                params.Simple.Html = Buffer.from(content).toString('base64');
            }
            if (options.text) {
                const content = await email!.render(
                    `${resourcePath!}/text`,
                    options.vars ?? {},
                );
                params.Simple.Text = Buffer.from(content).toString('base64');
            }
        } else {
            throw new Error(
                'Email to send must specify `template` or enabled `html`/`text` for tencent cloud driver',
            );
        }
        if (!options.subject) {
            params.Subject = await email!.render(
                `${resourcePath!}/subject`,
                options.vars ?? {},
            );
        }
        if (options.attachments) {
            params.Attachments = options.attachments.map((a) => ({
                FileName: a.filename,
                Content: a.content,
            }));
        }
        return params;
    }
}
