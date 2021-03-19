import { BaseSeeder, DbFactory } from '@/core';
import {
    AccessTokenEntity,
    CaptchaEntity,
    RefreshTokenEntity,
    UserEntity,
} from '@/modules/user/entities';
import { EntityManager } from 'typeorm';
import { IUserFactoryOptions } from '../factories/user.factory';

export default class UserSeeder extends BaseSeeder {
    protected truncates = [
        AccessTokenEntity,
        RefreshTokenEntity,
        CaptchaEntity,
        UserEntity,
    ];

    protected factorier!: DbFactory;

    public async run(_factorier: DbFactory, _em: EntityManager): Promise<any> {
        this.factorier = _factorier;
        await this.loadUsers();
    }

    private async loadUsers() {
        const userFactory = this.factorier(UserEntity);
        await userFactory<IUserFactoryOptions>({
            username: 'nangongmo',
            nickname: '南宫漠',
            phone: '+86.15157511637',
            email: 'canyang999@126.com',
            password: '123456aA$',
            actived: true,
        }).create();

        await userFactory<IUserFactoryOptions>({
            username: 'lishuai',
            nickname: '李帅',
            phone: '+86.15178787788',
            password: '123456aA$',
            actived: true,
        }).create();

        await userFactory<IUserFactoryOptions>({
            username: 'liyixing',
            nickname: '郦意鑫',
            phone: '+86.13787878888',
            password: '123456aA$',
            actived: true,
        }).create();

        await userFactory<IUserFactoryOptions>().createMany(15);
        // try {
        //     const data = await mailer().send<SmtpMailParams>({
        //         name: 'signup',
        //         html: true,
        //         text: true,
        //         subject: '测试1',
        //         to: [
        //             'lichnow@qq.com',
        //             'canyang999@126.com',
        //             'nangongmo1988@gmail.com',
        //         ],
        //     });
        //     console.log(data);
        // } catch (e) {
        //     console.log(e);
        // }
        // try {
        //     const data = await mailer().send<QcloudMailParams>(
        //         {
        //             name: 'signup',
        //             from: 'support@send.jikebianma.com',
        //             html: true,
        //             text: true,
        //             subject: '测试2',
        //             to: ['lichnow@qq.com'],
        //         },
        //         'qcloud',
        //     );
        //     console.log(data);
        // } catch (e) {
        //     console.log(e);
        // }
        // try {
        //     const data = await sms().send<AliyunSmsParams>(
        //         {
        //             numbers: ['+86.15157511637', '+86.18605853847'],
        //             template: 'SMS_150475918',
        //             vars: { code: '555' },
        //         },
        //         'aliyun',
        //     );
        //     console.log(data);
        // } catch (e) {
        //     console.log(e);
        // }

        // try {
        //     const data = await sms().send<QcloudSmsParams>({
        //         numbers: ['+86.15157511637', '+86.18605853847'],
        //         template: '776692',
        //         vars: { code: '666' },
        //     });
        //     console.log(data);
        // } catch (e) {
        //     console.log(e);
        // }
    }
}
