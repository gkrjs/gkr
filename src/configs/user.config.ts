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
