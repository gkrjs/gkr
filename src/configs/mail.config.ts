import { ConfigRegister, env, MailConfig } from '@/core';
import path from 'path';

export const mail: ConfigRegister<MailConfig> = () => ({
    default: env('EMAIL_DEFAULT', 'gmail'),
    enabled: [],
    connections: [
        {
            name: 'gmail',
            type: 'SMTP',
            option: {
                host: env('MAIL_HOST', 'localhost'),
                user: env('MAIL_USER', 'test'),
                password: env('MAIL_PASS', ''),
                from: env('MAIL_FROM', 'NanGongMo<support@localhost>'),
                port: env('MAIL_PORT', (v) => Number(v), 25),
                secure: env('MAIL_SSL', (v) => JSON.parse(v), false),
                // Email模板路径
                resource: path.resolve(__dirname, '../../assets/emails'),
            },
        },
        {
            name: 'aliyun',
            type: 'SMTP',
            option: {
                host: env('MAIL_ALIYUN_HOST', 'localhost'),
                user: env('MAIL_ALIYUN_USER', 'test'),
                password: env('MAIL_ALIYUN_PASS', ''),
                from: env('MAIL_ALIYUN_FROM', 'NanGongMo<support@localhost>'),
                port: env('MAIL_ALIYUN_PORT', (v) => Number(v), 25),
                secure: env('MAIL_ALIYUN_SSL', (v) => JSON.parse(v), false),
                // Email模板路径
                resource: path.resolve(__dirname, '../../assets/emails'),
            },
        },
        {
            name: 'qcloud',
            type: 'QCLOUD',
            option: {
                secretId: env('MAIL_QCLOUD_ID', 'your-secret-id'),
                secretKey: env('MAIL_QCLOUD_KEY', 'your-secret-key'),
                from: env('MAIL_QCLOUD_FROM', 'support@gkr.io'),
                resource: path.resolve(__dirname, '../../assets/emails'),
            },
        },
    ],
});
