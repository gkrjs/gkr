import { ConfigRegister, env, SmsConfig } from '@/core';

export const sms: ConfigRegister<SmsConfig> = () => ({
    default: env('SMS_DEFAULT', 'qcloud'),
    enabled: ['aliyun'],
    connections: [
        {
            name: 'aliyun',
            type: 'ALIYUN',
            option: {
                sign: env('SMS_ALIYUN_SING', '极客科技'),
                accessKeyId: env('SMS_ALIYUN_ID', 'your-access-id'),
                accessKeySecret: env('SMS_ALIYUN_SECRET', 'your-access-secret'),
            },
        },
        {
            name: 'qcloud',
            type: 'QCLOUD',
            option: {
                sign: env('SMS_QCLOUD_SING', '极客科技'),
                appid: env('SMS_QCLOUD_APPID', '1400437232'),
                secretId: env('SMS_QCLOUD_ID', 'your-secret-id'),
                secretKey: env('SMS_QCLOUD_KEY', 'your-secret-key'),
            },
        },
    ],
});
