import Email from 'email-templates';
import { Attachment } from 'nodemailer/lib/mailer';
import {
    CUtilConfigType,
    CUtilOptionType,
    NestedRecord,
    ValueOf,
} from '../../common';

/** ********************************** 配置 ****************************** */

/**
 * 邮件扩展配置
 *
 * @export
 * @interface MailConfig
 * @extends {CUtilConfigType<MailConnectionOption<T>>}
 * @template T
 */
export interface MailConfig<T extends NestedRecord = {}>
    extends CUtilConfigType<MailConnectionOption<T>> {}

/**
 * 驱动连接配置
 *
 * @export
 * @interface MailConnectionOption
 * @extends {CUtilOptionType<{
 *         type: MailerType;
 *         option: ValueOf<MailerOptions<T>>;
 *     }>}
 * @template T
 */
export interface MailConnectionOption<
    T extends NestedRecord = {}
> extends CUtilOptionType<{
        type: MailerType;
        option: ValueOf<MailerOptions<T>>;
    }> {}

/**
 * 驱动配置
 */
export type MailerOptions<T extends NestedRecord = {}> = {
    SMTP: {
        host: string;
        user: string;
        password: string;
        // Email模板总路径
        resource: string;
        from?: string;
        port?: number;
        secure?: boolean;
    };
    QCLOUD: {
        // Email模板总路径
        resource?: string;
        secretId: string;
        secretKey: string;
        from: string;
        region?: string;
        endpoint?: string;
    };
} & T;

/**
 * 驱动类型名称
 */
export type MailerType<T extends NestedRecord = {}> = keyof MailerOptions<T>;

/** ********************************** 发送选项 ****************************** */

/**
 * 公共发送接口配置
 *
 * @interface MailSendParams
 */
export interface MailSendParams {
    // 模板名称
    name?: string;
    // 发信地址
    from?: string;
    // 主题
    subject?: string;
    // 目标地址
    to: string | string[];
    // 回信地址
    reply?: string;
    // 是否加载html模板
    html?: boolean;
    // 是否加载text模板
    text?: boolean;
    // 模板变量
    vars?: Record<string, any>;
}

/**
 * STMP邮件发送参数
 *
 * @export
 * @interface SmtpMailParams
 * @extends {MailSendParams}
 */
export interface SmtpMailParams extends MailSendParams {
    // 是否预览
    preview?: boolean | Email.PreviewEmailOpts;
    // 主题前缀
    subjectPrefix?: string;
    // 附件
    attachments?: Attachment[];
}

/**
 * 腾讯云邮件发送参数
 *
 * @export
 * @interface QcloudMailParams
 * @extends {MailSendParams}
 */
export interface QcloudMailParams extends MailSendParams {
    // 别名
    alias?: string;
    // 附件
    attachments?: Array<{
        filename: string;
        content: string;
    }>;
    // 模板
    template?: string;
}
