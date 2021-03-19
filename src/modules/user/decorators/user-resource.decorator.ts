import { SetMetadata } from '@nestjs/common';
import { OWNER_RESOURCE } from '../constants';
import { UserEntity } from '../entities';
import {
    OwnerResourceMeta,
    UserMultiResourceMeta,
    UserResourceMeta,
} from '../types';

/**
 * * 用户直属资源检测装饰器
 * 通过此装饰器会判断传入的数据(比如根据一个post的id)是否属于当前的登录用户
 *
 * @export
 * @param {UserResourceMeta} {
 *     resource,
 *     queryField,
 *     ownerQueryField,
 *     relationName,
 * }
 * @return {*}
 */
export function UserResource({
    resource,
    queryField,
    ownerQueryField,
    relationName,
}: UserResourceMeta) {
    return SetMetadata<string, OwnerResourceMeta>(OWNER_RESOURCE, {
        resource: {
            model: resource,
            queryColumn: queryField,
            ownerResourceName: relationName ?? 'user',
        },
        owner: {
            model: UserEntity,
            requestKey: 'user',
            queryColumn: ownerQueryField,
        },
    });
}

/**
 * 判断多个资源
 *
 * @export
 * @param {UserMultiResourceMeta} { meta, ownerQueryField, relationName }
 * @return {*}
 */
export function UserResources({
    meta,
    ownerQueryField,
    relationName,
}: UserMultiResourceMeta) {
    return SetMetadata<string, OwnerResourceMeta>('ownerShip', {
        resource: meta.map((item) => ({
            model: item.resource,
            queryColumn: item.queryField,
            ownerResourceName: relationName ?? 'user',
        })),
        owner: {
            model: UserEntity,
            requestKey: 'user',
            queryColumn: ownerQueryField,
        },
    });
}
