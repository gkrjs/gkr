import { config } from '@/core';
import merge from 'deepmerge';
import { get } from 'lodash';
import { CaptchaActionType, CaptchaType, UserFeatures } from './constants';
import { CustomUserConfig, DefaultUserConfig, UserConfig } from './types';

const getDefaultCaptcha = (type: CaptchaType) => {
    const defaultCaptchas = { enabled: false, limit: 60, expired: 60 * 5 };
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
 * 默认验证码配置
 */
const defaultConfig: DefaultUserConfig = {
    hash: 10,
    enabled: ['CREDENTIAL_LOGIN', 'USERNAME_REGISTER'],
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
    if (typeof custom.enabled === 'boolean' || custom.enabled) {
        custom.enabled = UserFeatures;
    }
    const userConfig = merge(defaultConfig, config<UserConfig>('user') ?? {}, {
        arrayMerge: (_d, s, _o) => Array.from(new Set(s)),
    }) as UserConfig;
    return key ? get(userConfig, key) : userConfig;
}
