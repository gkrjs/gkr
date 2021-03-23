import { ConfigRegister, env } from '@/core';
import { CommentEntity, PostEntity } from '@/modules/content/entities';
import { CustomUserConfig } from '@/modules/user';
import { OneToMany } from 'typeorm';

/**
 * 用户模块配置
 */
export const user: ConfigRegister<CustomUserConfig> = () => ({
    hash: 10,
    jwt: {
        secret: env('AUTH_TOKEN_SECRET', 'my-secret'),
        refresh_secret: env('AUTH_REFRESH_TOKEN_SECRET', 'my-refresh-secret'),
    },
    // 需要启用的功能,如果是true则全部启用
    features: true,
    // features: [
    //     // 发送登录短信验证码以及手机号登录
    //     'PHONE_LOGIN',
    //     // 发送登录邮箱验证码以及邮箱地址登录
    //     'EMAIL_LOGIN',
    //     // 发送注册短信验证码以及手机号注册
    //     'PHONE_REGISTER',
    //     // 发送注册邮件验证码以及邮箱地址注册
    //     'EMAIL_REGISTER',
    //     // 发送找回密码手机验证码以及通过手机号找回密码
    //     'PHONE_RETRIEVE_PASSWORD',
    //     // 发送找回密码邮件验证码以及通过邮箱地址找回密码
    //     'EMAIL_RETRIEVE_PASSWORD',
    //     // 通过凭证(用户名,邮箱,手机号)找回密码
    //     // 根据 'PHONE_RETRIEVE_PASSWORD'以及'EMAIL_RETRIEVE_PASSWORD'的设置自动判断是否发送邮件以及短信
    //     'CREDENTIAL_RETRIEVE_PASSWORD',
    //     // 发送重置密码短信以及通过手机号重置密码
    //     'PHONE_RESET_PASSWORD',
    //     // 发送重置密码邮件以及通过手机号重置密码
    //     'EMAIL_RESET_PASSWORD',
    //     // 在登录后可直接重置密码
    //     'ACCOUNT_RESET_PASSWORD',
    //     // 发送绑定手机号短信以及通过验证码绑定手机
    //     'BOUND_PHONE',
    //     // 发送绑定邮箱地址邮件以及通过验证码绑定邮箱
    //     'BOUND_EMAIL',
    //     // 通过凭证(用户名,邮箱,手机号)+密码的方式登录用户
    //     'CREDENTIAL_LOGIN',
    //     // 通过用户名+密码的方式注册用户
    //     'USERNAME_REGISTER',
    //     // 登出用户
    //     'LOGOUT',
    //     // 获取用户信息
    //     'GET_INFO',
    //     // 更新用户信息
    //     'UPDATE_INFO',
    // ],
    captcha: {
        sms: {
            login: {
                enabled: true,
                template: env('SMS_LOGIN_CAPTCHA_QCLOUD', 'your-id'),
            },
            register: {
                enabled: true,
                template: env('SMS_REGISTER_CAPTCHA_QCLOUD', 'your-id'),
            },
            'retrieve-password': {
                enabled: false,
                template: env('SMS_RETRIEVEPASSWORD_CAPTCHA_QCLOUD', 'your-id'),
            },
        },
        email: {
            register: {
                enabled: true,
            },
            'retrieve-password': {
                enabled: true,
            },
        },
    },
    relations: [
        {
            column: 'posts',
            relation: OneToMany(
                () => PostEntity,
                (post) => post.author,
                {
                    cascade: true,
                },
            ),
        },
        {
            column: 'comments',
            relation: OneToMany(
                () => CommentEntity,
                (comment) => comment.creator,
                {
                    cascade: true,
                },
            ),
        },
    ],
});
