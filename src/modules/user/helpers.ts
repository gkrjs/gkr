import { ArrayItem, config } from '@/core';
import merge from 'deepmerge';
import { get } from 'lodash';
import { CaptchaActionType, CaptchaType, FeatureEnabled } from './constants';
import { CustomUserConfig, DefaultUserConfig, UserConfig } from './types';

/**
 * 获取默认的验证码配置
 *
 * @param {CaptchaType} type
 * @return {*}
 */
const getDefaultCaptcha = (type: CaptchaType) => {
    const defaultCaptchas = { limit: 60, expired: 60 * 5 };
    const subjects: { [key in CaptchaActionType]: string } = {
        register: '【用户注册】验证码',
        login: '【用户登录】验证码',
        'retrieve-password': '【找回密码】验证码',
        'reset-password': '【重置密码】验证码',
        'account-bound': '【绑定邮箱】验证码',
    };
    return Object.fromEntries(
        Object.values(CaptchaActionType).map((t) => [
            t,
            type === CaptchaType.SMS
                ? defaultCaptchas
                : { ...defaultCaptchas, subject: subjects[t] },
        ]),
    );
};

/**
 * 默认用户配置
 */
const defaultConfig: DefaultUserConfig = {
    hash: 10,
    features: ['CREDENTIAL_LOGIN', 'USERNAME_REGISTER'],
    jwt: {
        token_expired: 3600,
        refresh_token_expired: 3600 * 30,
    },
    captcha: {
        sms: getDefaultCaptcha(CaptchaType.SMS) as any,
        email: getDefaultCaptcha(CaptchaType.EMAIL) as any,
    },
    relations: [],
};
/**
 * 生成随机验证码
 *
 * @export
 * @returns
 */
export function generateCatpchaCode() {
    return Math.random().toFixed(6).slice(-6);
}

/**
 * 获取user模块配置的值
 *
 * @export
 * @template T
 * @param {string} [key]
 * @return {*}  {T}
 */
export function getUserConfig<T>(key?: string): T {
    const custom = config<CustomUserConfig>('user');
    if (typeof custom.features === 'boolean' || custom.features) {
        custom.features = FeatureEnabled;
    }
    const userConfig = merge(defaultConfig, config<UserConfig>('user') ?? {}, {
        arrayMerge: (_d, s, _o) => Array.from(new Set([..._d, ...s])),
    }) as UserConfig;
    return key ? get(userConfig, key) : userConfig;
}

export function IsUserEnabled(
    feature: ArrayItem<typeof FeatureEnabled> | typeof FeatureEnabled,
    operation: 'and' | 'or' = 'or',
): boolean {
    if (Array.isArray(feature)) {
        if (operation === 'and') {
            return feature.every((f) =>
                getUserConfig<typeof FeatureEnabled>('features').includes(f),
            );
        }
        return !!feature.find((f) =>
            getUserConfig<typeof FeatureEnabled>('features').includes(f),
        );
    }
    return getUserConfig<typeof FeatureEnabled>('features').includes(feature);
}
