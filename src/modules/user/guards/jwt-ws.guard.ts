import { isPreview } from '@/core';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { TokenService } from '../services';

/**
 * 用户JWT认证守卫
 * 检测用户是否已登录
 *
 * @export
 * @class JwtAuthGuard
 * @extends {AuthGuard('jwt')}
 */
@Injectable()
export class JwtWsGuard implements CanActivate {
    constructor(private readonly tokenService: TokenService) {}

    /**
     * 守卫方法
     *
     * @param {ExecutionContext} context
     * @returns
     * @memberof JwtAuthGuard
     */
    async canActivate(context: ExecutionContext) {
        const { token } = context.switchToWs().getData();
        if (!token) {
            throw new WsException('Missing access token');
        }
        if (isPreview()) return true;
        // 判断token是否存在,如果不存在则认证失败
        const accessToken = await this.tokenService.checkAccessToken(token);
        if (!accessToken) throw new WsException('Access token incorrect');
        const user = await this.tokenService.verifyAccessToken(accessToken);
        return !!user;
    }
}
