import { defineFactory } from '@/core';
import { UserEntity } from '@/modules/user/entities';
import Faker from 'faker';

export type IUserFactoryOptions = Partial<
    {
        [key in keyof UserEntity]: UserEntity[key];
    }
>;
export const UserFactory = defineFactory(
    UserEntity,
    async (faker: typeof Faker, settings: IUserFactoryOptions = {}) => {
        faker.setLocale('zh_CN');
        const user = new UserEntity();
        const optionals: (keyof IUserFactoryOptions)[] = [
            'username',
            'password',
            'email',
            'phone',
        ];
        optionals.forEach((key) => {
            if (settings[key] !== undefined) {
                user[key] = settings[key] as never;
            }
        });
        user.nickname = settings.nickname ?? faker.name.findName();
        user.actived = settings.actived ?? Math.random() >= 0.5;
        return user;
    },
);
