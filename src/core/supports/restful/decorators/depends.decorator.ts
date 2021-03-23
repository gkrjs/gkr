import { SetMetadata, Type } from '@nestjs/common';
import { CONTROLLER_DEPENDS } from '../constants';
/**
 * 控制器依赖的模块列表装饰器
 * @param depends
 */
export const Depends = (...depends: Type<any>[]) =>
    SetMetadata(CONTROLLER_DEPENDS, depends ?? []);
