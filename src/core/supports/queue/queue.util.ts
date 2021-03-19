import { BullModule, BullModuleOptions } from '@nestjs/bull';
import { DynamicModule, ModuleMetadata, Type } from '@nestjs/common';
import { omit } from 'lodash';
import {
    App,
    ConnectionUtil,
    PluginModuleMeta,
    UtilConfigMaps,
} from '../../common';
import { RedisUtil } from '../redis';
import { QueueConfig, QueueOption, QueuePluginOption } from './types';

/**
 * 列队设置
 *
 * @export
 * @class Redis
 * @extends {BasePlugin<RedisModuleOptions[]>}
 */
export class QueueUtil extends ConnectionUtil<QueueConfig, QueueOption> {
    protected name = 'queue';

    /**
     * 配置映射
     *
     * @protected
     * @type {IConfigMaps}
     * @memberof Redis
     */
    protected configMaps: UtilConfigMaps = {
        required: true,
        maps: 'redis',
    };

    protected _pluginMeta: Array<{
        module: Type<any>;
        meta: Required<Pick<ModuleMetadata, 'imports' | 'providers'>>;
    }> = [];

    globalMeta() {
        const redis = App.utiler.get(RedisUtil);
        return {
            imports: this._options.map((option) => {
                if (option.redis && !redis.enabled.includes(option.redis)) {
                    throw new Error(
                        `Redis connection config named ${option.redis} not exists!`,
                    );
                }
                return BullModule.forRoot(option.name, {
                    redis: redis.getOption(option.redis),
                    ...omit(option, ['name', 'redis']),
                });
            }),
        };
    }

    pluginMeta(plugin: Type): Omit<ModuleMetadata, 'controllers'> {
        const item = this._pluginMeta.find((p) => p.module === plugin);
        return item ? item.meta : {};
    }

    pluginLoad(
        pluginModule: Type,
        pluginMeta: PluginModuleMeta<QueuePluginOption>,
    ) {
        let producers: DynamicModule[] = [];
        let consumers: Type<any>[] = [];
        const { queue } = pluginMeta;
        if (queue?.producers) {
            queue.producers.forEach((option) => {
                if (
                    option.configKey &&
                    !this._enabled.includes(option.configKey)
                ) {
                    throw new Error(
                        `Queue connection config named ${option.configKey} not exists!`,
                    );
                }
            });
            producers = queue.producers.map((option) =>
                BullModule.registerQueue({
                    ...option,
                    configKey: option.configKey ?? this._default,
                }),
            );
        }
        if (queue?.consumers) {
            consumers = queue.consumers;
        }
        this._pluginMeta.push({
            module: pluginModule,
            meta: { imports: producers, providers: consumers },
        });
    }

    addProducers(...producers: BullModuleOptions[]) {
        producers.forEach((option) => {
            if (option.configKey && !this._enabled.includes(option.configKey)) {
                throw new Error(
                    `Queue connection config named ${option.configKey} not exists!`,
                );
            }
        });

        return producers.map((option) =>
            BullModule.registerQueue({
                ...option,
                configKey: option.configKey ?? this._default,
            }),
        );
    }
}
