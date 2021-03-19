import { ConnectionUtil, UtilConfigMaps } from '@/core/common';
import { ModuleMetadata } from '@nestjs/common';
import IORedis from 'ioredis';
import { RedisModule, RedisService } from 'nestjs-redis';
import { RedisConfig, RedisOption } from './types';

/**
 * Redis扩展
 *
 * @export
 * @class RedisUtil
 * @extends {BaseUtil<RedisModuleOptions[]>}
 */
export class RedisUtil extends ConnectionUtil<RedisConfig, RedisOption> {
    protected name = 'redis';

    protected configMaps: UtilConfigMaps = {
        required: true,
        maps: 'redis',
    };

    /**
     * 外部注入的nestjs-redis服务
     *
     * @private
     * @type {RedisService}
     * @memberof Redis
     */
    private redis!: RedisService;

    /**
     * 设置nestjs-redis服务
     *
     * @param {RedisService} redis
     * @returns {Redis}
     * @memberof Redis
     */
    setRedisService(redis: RedisService): RedisUtil {
        this.redis = redis;
        return this;
    }

    /**
     * 根据名称创建客户端连接
     *
     * @param {string} [name]
     * @returns {IORedis.Redis}
     * @memberof Redis
     */
    getClient(name?: string): IORedis.Redis {
        return this.redis.getClient(name ?? this._default);
    }

    /**
     * 获取所有客户端连接
     *
     * @returns {Map<string, IORedis.Redis>}
     * @memberof Redis
     */
    getClients(): Map<string, IORedis.Redis> {
        return this.redis.getClients();
    }

    getGlobalMeta(): ModuleMetadata {
        return {
            imports: [RedisModule.register(this.options)],
            providers: [
                {
                    provide: RedisUtil,
                    useFactory: (redisService: RedisService) =>
                        this.setRedisService(redisService),
                    inject: [RedisService],
                },
            ],
        };
    }
}
