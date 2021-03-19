import {
    createParamDecorator,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { getManager } from 'typeorm';
import { UserRepository } from '../repositories';
import { RequestUser } from '../types';
/**
 * 当前用户装饰器
 * 通过request查询通过jwt解析出来的当前登录的ID查询当前用户模型实例
 * 并用于控制器直接注入
 */
export const ReqUser = createParamDecorator(
    async (_data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const reqUser = request.user as RequestUser;
        const userRepository = getManager().getCustomRepository(UserRepository);
        // 开发环境下为了避免麻烦暂时直接使用第一个用户,无需登录
        // if (environment() === EnviromentType.DEV) {
        //     return (await userRepository.find())[0];
        // }
        if (!reqUser) throw new ForbiddenException();
        return userRepository.findOneOrFail(reqUser.id);
    },
);
