import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../services';

/**
 * 用户认证本地策略
 *
 * @export
 * @class LocalStrategy
 * @extends {PassportStrategy(Strategy)}
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService) {
        super({
            usernameField: 'credential',
            passwordField: 'password',
        });
    }

    async validate(credential: string, password: string): Promise<any> {
        const user = await this.authService.login(credential, password);
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
