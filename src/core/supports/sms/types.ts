import {
    CUtilConfigType,
    CUtilOptionType,
    NestedRecord,
    ValueOf,
} from '../../common';

/**
 * 短信配置
 *
 * @export
 * @interface SmsConfig
 * @extends {CUtilConfigType<SmsConnectionOption<T>>}
 * @template T
 */
export interface SmsConfig<T extends NestedRecord = {}>
    extends CUtilConfigType<SmsConnectionOption<T>> {}

/**
 * 短信连接配置
 *
 * @export
 * @interface SmsConnectionOption
 * @extends {CUtilOptionType<{
 *         type: SmsDriverType<T>;
 *         option: ValueOf<SmsDriverOptions<T>>;
 *     }>}
 * @template T
 */
export interface SmsConnectionOption<
    T extends NestedRecord = {}
> extends CUtilOptionType<{
        type: SmsDriverType<T>;
        option: ValueOf<SmsDriverOptions<T>>;
    }> {}

/**
 * 驱动配置
 */
export type SmsDriverOptions<T extends NestedRecord = {}> = {
    // 阿里云驱动配置
    ALIYUN: {
        accessKeyId: string;
        accessKeySecret: string;
        sign: string;
        endpoint?: string;
    };
    // 腾讯云驱动配置
    QCLOUD: {
        secretId: string;
        secretKey: string;
        sign: string;
        appid: string;
        endpoint?: string;
    };
} & T;

/**
 * 短信驱动类型
 */
export type SmsDriverType<
    T extends NestedRecord = {}
> = keyof SmsDriverOptions<T>;

/**
 * 公共发送接口配置
 *
 * @export
 * @interface SmsSendParams
 */
export interface SmsSendParams {
    numbers: string[];
    template: string;
    sign?: string;
    endpoint?: string;
    vars?: Record<string, any>;
}

/**
 * 阿里云短信发送配置
 *
 * @export
 * @interface AliyunSmsParams
 * @extends {SmsSendParams}
 */
export interface AliyunSmsParams extends SmsSendParams {
    others?: {
        SmsUpExtendCode?: string;
        OutId?: string;
    };
}

/**
 * 腾讯云短信发送配置
 *
 * @export
 * @interface QcloudSmsParams
 * @extends {SmsSendParams}
 */
export interface QcloudSmsParams extends SmsSendParams {
    appid?: string;
    others?: {
        ExtendCode?: string;
        SessionContext?: string;
        SenderId?: string;
    };
}
