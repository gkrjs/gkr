import { ArrayItem, DynamicRelation } from '@/core';
import { ObjectType } from 'typeorm';
import { CaptchaActionType, CaptchaType, UserFeatures } from './constants';
import { CaptchaEntity } from './entities';

/** ************************************ 模块配置 ******************************** */
export type AuthFeature = ArrayItem<typeof UserFeatures>;

/**
 * 用户模块配置
 *
 * @export
 * @interface UserConfig
 */
export interface UserConfig {
    hash: number; // 密码加密散列值
    jwt: Required<JwtConfig>; // jwt配置
    enabled: Array<AuthFeature> | boolean;
    captcha: CaptchaConfig; // 验证码配置
    relations: DynamicRelation[];
}

/**
 * 用户模块自定义配置
 *
 * @export
 * @interface CustomUserConfig
 */
export interface CustomUserConfig {
    hash?: number;
    enabled?: Array<AuthFeature> | boolean;
    jwt: JwtConfig;
    captcha?: CustomCaptchaConfig;
    relations?: DynamicRelation[];
}
/**
 * 默认用户模块配置
 *
 * @export
 * @interface UserConfig
 */
export interface DefaultUserConfig {
    hash: number;
    jwt: Pick<Required<JwtConfig>, 'token_expired' | 'refresh_token_expired'>;
    enabled: Array<AuthFeature>;
    captcha: DefaultCaptchaConfig;
    relations: DynamicRelation[];
}
/** ************************************ 认证 ******************************** */

/**
 * JWT配置
 *
 * @export
 * @interface JwtConfig
 */
export interface JwtConfig {
    secret: string; // jwt加密密匙
    token_expired?: number; // token有效时间
    refresh_secret: string; // refresh_toke的加密密匙
    refresh_token_expired?: number; // refresh_token有效时间
}

/**
 * JWT荷载
 *
 * @export
 * @interface JwtPayload
 */
export interface JwtPayload {
    sub: string;
    iat: number;
}

/**
 * 由JWT策略解析荷载后存入Rquest.user的对象
 *
 * @export
 * @interface RequestUser
 */
export interface RequestUser {
    id: string;
}

/** ************************************ 验证码 ******************************** */
/**
 * 实际验证码配置
 *
 * @export
 * @interface CaptchaConfig
 */
export interface CaptchaConfig {
    // 手机验证码
    [CaptchaType.SMS]: { [key in CaptchaActionType]: SmsCaptchaOption };
    // 邮件验证码
    [CaptchaType.EMAIL]: { [key in CaptchaActionType]: EmailCaptchaOption };
}

/**
 * 自定义验证码配置
 *
 * @export
 * @interface CustomCaptchaConfig
 */
export interface CustomCaptchaConfig {
    [CaptchaType.SMS]?: {
        [key in CaptchaActionType]?: Partial<CaptchaOption> &
            Pick<SmsCaptchaOption, 'template'>;
    };
    [CaptchaType.EMAIL]?: {
        [key in CaptchaActionType]?: Partial<CaptchaOption> &
            Pick<EmailCaptchaOption, 'template'> & { subject?: string };
    };
}

/**
 * 默认验证码配置
 *
 * @export
 * @interface DefaultCaptchaConfig
 */
export interface DefaultCaptchaConfig {
    [CaptchaType.SMS]: {
        [key in CaptchaActionType]: Omit<CaptchaOption, 'driver'>;
    };
    [CaptchaType.EMAIL]: {
        [key in CaptchaActionType]: Omit<CaptchaOption, 'driver'> &
            Pick<EmailCaptchaOption, 'subject'>;
    };
}

/**
 * 通用验证码选项
 *
 * @export
 * @interface CaptchaOption
 */
export interface CaptchaOption {
    enabled: boolean; // 是否启用
    limit: number; // 验证码发送间隔时间
    expired: number; // 验证码有效时间
    driver?: string; // 发送验证码的短信或邮件的驱动名
}

/**
 * 手机验证码选项
 *
 * @export
 * @interface SmsCaptchaOption
 * @extends {CaptchaOption}
 */
export interface SmsCaptchaOption extends CaptchaOption {
    template: string; // 云厂商短信推送模板ID
}

/**
 * 邮件验证码选项
 * 注意,这里的template为云厂商邮件推送模板ID
 * 如果不设置template则默认使用邮件html模板
 * 注册的模板为registration/html.pug
 * 重置密码的模板为reset-password/html.pug
 *
 * @export
 * @interface EmailCaptchaOption
 * @extends {CaptchaOption}
 */
export interface EmailCaptchaOption extends CaptchaOption {
    subject: string; // 邮件主题
    template?: string; // 云厂商邮件推送模板ID
}

export interface SendCaptchaQueueJob {
    captcha: { [key in keyof CaptchaEntity]: CaptchaEntity[key] };
    option: SmsCaptchaOption | EmailCaptchaOption;
    otherVars?: Record<string, any>;
}

export type CaptchaValidate<T extends Record<string, any> = {}> = T & {
    value: string;
    code: string;
};

/** ************************************ 所属资源判断 ******************************** */
/**
 * 所属资源接口
 *
 * @export
 * @interface OwnerResourceType
 */
export interface OwnerResourceType {
    model: ObjectType<{ [key: string]: any }>;
    queryColumn?: string;
    ownerResourceName?: string;
}

/**
 * 所属资源元数据接口
 *
 * @export
 * @interface OwnerResourceMeta
 */
export interface OwnerResourceMeta {
    resource: OwnerResourceType | OwnerResourceType[];
    owner: {
        model: ObjectType<{ [key: string]: any }>;
        requestKey: string;
        queryColumn?: string;
    };
}

export interface UserResourceMeta {
    // 与用户关联的模型,譬如 Post
    resource: ObjectType<{ [key: string]: any }>;
    // 与Request的传入数据(params,body,query)对应查询的键, 譬如 id(Post的id)
    queryField?: string;
    // 与Request中的'user'值组成查询添加的字段名,譬如 id
    ownerQueryField?: string;
    // 所属模型与用户模型关联的字段,譬如 author
    relationName?: string;
}

export interface UserMultiResourceMeta {
    meta: Array<{
        resource: ObjectType<{ [key: string]: any }>;
        queryField?: string;
    }>;
    ownerQueryField?: string;
    relationName?: string;
}
