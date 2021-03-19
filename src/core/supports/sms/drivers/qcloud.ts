import { pick } from 'lodash';
import * as tencentcloud from 'tencentcloud-sdk-nodejs';
import { SendSmsRequest } from 'tencentcloud-sdk-nodejs/tencentcloud/services/sms/v20190711/sms_models';
import { QcloudSmsParams, SmsDriverOptions } from '../types';
import { BaseSms } from './base';

const SmsClient = tencentcloud.sms.v20190711.Client;
type DriverConfig = SmsDriverOptions['QCLOUD'];
type Client = InstanceType<typeof SmsClient>;

/**
 * 腾讯云短信驱动
 *
 * @export
 * @class QcloudSms
 * @extends {BaseSms<DriverConfig, Client>}
 */
export class QcloudSms extends BaseSms<DriverConfig, Client, QcloudSmsParams> {
    /**
     * 创建腾讯云短信服务客户端
     *
     * @protected
     * @param {DriverConfig} config
     * @return {*}
     * @memberof QcloudSms
     */
    protected makeClient(config: DriverConfig) {
        return new SmsClient({
            credential: pick(config, ['secretId', 'secretKey']),
            region: '',
            profile: {
                httpProfile: {
                    endpoint: config.endpoint ?? 'sms.tencentcloudapi.com',
                },
            },
        });
    }

    /**
     * 腾讯云短信发送器
     *
     * @protected
     * @param {Client} client
     * @param {QcloudSmsParams} options
     * @param {DriverConfig} config
     * @return {*}
     * @memberof QcloudSms
     */
    protected async makeSend(
        client: Client,
        options: QcloudSmsParams,
        config: DriverConfig,
    ) {
        return client.SendSms(this.transSendParams(options, config));
    }

    /**
     * 转义通用发送参数为腾讯云短信服务发送参数
     *
     * @protected
     * @param {QcloudSmsParams} options
     * @param {DriverConfig} config
     * @return {*}  {SendSmsRequest}
     * @memberof QcloudSms
     */
    protected transSendParams(
        options: QcloudSmsParams,
        config: DriverConfig,
    ): SendSmsRequest {
        return {
            PhoneNumberSet: options.numbers.map((n) => {
                const phoneArr: string[] = n.split('.');
                return `${phoneArr[0]}${phoneArr[1]}`;
            }),
            TemplateID: options.template,
            SmsSdkAppid: options.appid ?? config.appid,
            Sign: options.sign ?? config.sign,
            TemplateParamSet: Object.values(options.vars ?? {}),
            ...(options.others ?? {}),
        };
    }
}
