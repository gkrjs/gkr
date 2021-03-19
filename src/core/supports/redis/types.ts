import { CUtilConfigType, CUtilOptionType } from '@/core/common';
import { RedisModuleOptions } from 'nestjs-redis';

/**
 * Redis配置
 *
 * @export
 * @interface RedisConfig
 */
export interface RedisConfig extends CUtilConfigType<RedisOption> {}
export interface RedisOption extends CUtilOptionType<RedisModuleOptions> {}
