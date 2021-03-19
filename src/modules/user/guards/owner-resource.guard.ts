import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { OwnerService } from '../services';

/**
 * 资源是否属于当前登录用户或者用户关联的某个模型
 *
 * @export
 * @class OwnerResourceGuard
 * @implements {CanActivate}
 */
@Injectable()
export class OwnerResourceGuard implements CanActivate {
    constructor(private readonly ownerService: OwnerService) {}

    /**
     * 进行验证
     *
     * @param {ExecutionContext} context
     * @returns {Promise<boolean>}
     * @memberof OwnerResourceGuard
     */
    public async canActivate(context: ExecutionContext): Promise<boolean> {
        // 如果是开发环境则直接跳过验证
        // if (environment() === 'development') return true;
        return this.ownerService.validate(context);
    }
}
