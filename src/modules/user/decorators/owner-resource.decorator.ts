import { SetMetadata } from '@nestjs/common';
import { OWNER_RESOURCE } from '../constants';
import { OwnerResourceMeta } from '../types';

/**
 * 资源所属装饰器
 * @param meta
 */
export const OwnerResource = (meta: OwnerResourceMeta) =>
    SetMetadata<string, OwnerResourceMeta>(OWNER_RESOURCE, meta);
