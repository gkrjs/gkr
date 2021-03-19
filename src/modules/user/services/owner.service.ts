import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { get, lowerFirst } from 'lodash';
import { getManager } from 'typeorm';
import { OWNER_RESOURCE } from '../constants';
import { OwnerResourceMeta, OwnerResourceType } from '../types';

/**
 * 资源所属判断服务
 * 判断资源是否属于当前登录用户或者用户关联的某个模型
 *
 * @export
 * @class OwnerService
 */
@Injectable()
export class OwnerService {
    constructor(protected readonly reflector: Reflector) {}

    /**
     * 验证所属
     *
     * @param {ExecutionContext} context
     * @returns
     * @memberof OwnerService
     */
    async validate(context: ExecutionContext) {
        // 获取当前请求,请确保用户以及其关联的模型所需的数据已经在jwtstrategy中添加
        const request = context.switchToHttp().getRequest();
        // 获取请求的控制器方法上的装饰器写入的ownerResource元数据
        const meta = this.reflector.get<OwnerResourceMeta | undefined>(
            OWNER_RESOURCE,
            context.getHandler(),
        );
        // 如果没有元数据则证明不需要验证,直接返回true
        if (!meta) return true;
        // 通过判断元数据中resrouce是否为数组来确定用单个验证还是多个验证
        if (Array.isArray(meta.resource)) {
            return meta.resource.every(async (item) =>
                this.check({ resource: item, owner: meta.owner }, request),
            );
        }
        return this.check(
            { resource: meta.resource, owner: meta.owner },
            request,
        );
    }

    /**
     * 验证实现
     *
     * @protected
     * @param {{
     *             resource: OwnerResourceType;
     *             owner: OwnerResourceMeta['owner'];
     *         }} meta
     * @param {*} request
     * @returns
     * @memberof OwnerService
     */
    protected async check(
        meta: {
            resource: OwnerResourceType;
            owner: OwnerResourceMeta['owner'];
        },
        request: any,
    ) {
        const { resource, owner } = meta;
        // 默认所属资源查询字段为id
        resource.queryColumn = resource.queryColumn ?? 'id';
        // 如果关联名称relationName没设置, 则使用首字母小写的onwer的类名;
        resource.ownerResourceName =
            resource.ownerResourceName ?? lowerFirst(owner.model.name);
        // 默认所属者资源查询字段为id
        owner.queryColumn = owner.queryColumn ?? 'id';
        // 在request中拿到需要获取的由jwt返回的onwer模型的查询字段
        const requestValue = get(request, owner.requestKey, undefined);
        // 如果没有这个字段则验证失败
        if (!requestValue) return false;
        // 通过owner模型的查询获取当前onwer模型的数据
        const ownerItem = await getManager().findOneOrFail(owner.model, {
            [owner.queryColumn]: requestValue,
        });
        // 在请求数据类型中有一种有queryColumn这个字段就可以
        const queryValue =
            request.params[resource.queryColumn] ??
            request.body[resource.queryColumn] ??
            request.query[resource.queryColumn];
        // 通过query来查询resource模型,并添加onwer关联
        const val: any = await getManager().findOne(resource.model, {
            relations: [resource.ownerResourceName],
            where: { [resource.queryColumn]: queryValue },
        });
        // 如果资源不存在或者资源的owner关联不存在则验证失败
        if (!val || !val[resource.ownerResourceName]) return false;
        // 通过资源关联的ower的id与在request中获取并查询出来的onwer的id进行对比来判断是否验证成功
        // 如果相同,则证明此resource属于当前请求用户关联的owner模型
        return val[resource.ownerResourceName].id === ownerItem.id;
    }
}
