import Dysmsapi20170525, { SendSmsRequest } from '@alicloud/dysmsapi20170525';
import * as $OpenApi from '@alicloud/openapi-client';
import { AliyunSmsParams, SmsDriverOptions } from '../types';
import { BaseSms } from './base';

type DriverConfig = SmsDriverOptions['ALIYUN'];

/**
 * 阿里云短信驱动
 *
 * @export
 * @class AliyunSms
 * @extends {BaseSms<DriverConfig, Dysmsapi20170525, AliyunSmsParams>}
 */
export class AliyunSms extends BaseSms<
    DriverConfig,
    Dysmsapi20170525,
    AliyunSmsParams
> {
    /**
     * 创建阿里云短信服务客户端
     *
     * @protected
     * @param {DriverConfig} config
     * @return {*}
     * @memberof AliyunSms
     */
    protected makeClient(config: DriverConfig) {
        const configed = new $OpenApi.Config(config);
        config.endpoint = config.endpoint ?? 'dysmsapi.aliyuncs.com';
        return new Dysmsapi20170525(configed);
    }

    /**
     * 阿里云短信发送器
     *
     * @protected
     * @param {Dysmsapi20170525} client
     * @param {AliyunSmsParams} options
     * @param {DriverConfig} config
     * @return {*}
     * @memberof AliyunSms
     */
    protected async makeSend(
        client: Dysmsapi20170525,
        options: AliyunSmsParams,
        config: DriverConfig,
    ) {
        const sendSmsRequest = new SendSmsRequest(
            this.transSendParams(options, config),
        );
        return client.sendSms(sendSmsRequest);
    }

    /**
     * 转义通用发送参数为阿里云短信服务发送参数
     *
     * @protected
     * @param {AliyunSmsParams} options
     * @param {DriverConfig} config
     * @return {*}
     * @memberof AliyunSms
     */
    protected transSendParams(options: AliyunSmsParams, config: DriverConfig) {
        return {
            phoneNumbers: options.numbers
                .map((n) => {
                    const phoneArr: string[] = n.split('.');
                    return phoneArr[0] === '+86'
                        ? phoneArr[1]
                        : `${phoneArr[0]}${phoneArr[1]}`;
                })
                .join(','),
            templateCode: options.template,
            signName: options.sign ?? config.sign,
            templateParam: JSON.stringify(options.vars),
            ...(options.others ?? {}),
        };
    }
}
