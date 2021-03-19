import { ModuleMetadata, Type } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { getConnection } from 'typeorm';
import { isInSource } from '../../../common/helpers';
import { PluginModuleMeta } from '../../../common/types';
import * as commands from '../commands';
import { DbFactoryOption, DbPluginOption } from '../types';
import { BaseDbUtil } from './base.dbutil';

export class DbUtil extends BaseDbUtil {
    /**
     * 获取全局模块元数据(导入TypeOrm.forRoot)
     *
     * @return {*}
     * @memberof DbUtil
     */
    globalMeta() {
        return {
            imports: (this.getNestOptions() ?? []).map((option) =>
                TypeOrmModule.forRoot(option),
            ),
        };
    }

    /**
     * 获取插件元数据(在每个模块导入TypeOrm.forFeature,以及容器化Subsciber,Repository等)
     *
     * @param {Type} plugin
     * @return {*}  {Omit<ModuleMetadata, 'controllers'>}
     * @memberof DbUtil
     */
    pluginMeta(plugin: Type): Omit<ModuleMetadata, 'controllers'> {
        const item = this._pluginMeta.find((p) => p.module === plugin);
        return item ? item.meta : {};
    }

    /**
     * 获取所有数据库命令
     *
     * @return {*}
     * @memberof DbUtil
     */
    commands() {
        return isInSource()
            ? Object.values(commands)
            : [commands.MRNCommand, commands.MRTCommand, commands.MRFCommand];
    }

    /**
     * 关闭数据库连接
     *
     * @memberof DbUtil
     */
    async closed() {
        await Promise.allSettled(
            this.getNestOptions().map(async (option) => {
                try {
                    await getConnection(option.name).close();
                    return true;
                } catch (err) {
                    return false;
                }
            }),
        );
        await Promise.allSettled(
            this.getOptions().map(async (option) => {
                try {
                    return await getConnection(option.name).close();
                } catch (err) {
                    return false;
                }
            }),
        );
    }

    /**
     * 加载插件元数据
     *
     * @param {Type} pluginModule
     * @param {PluginModuleMeta<DbPluginOption>} pluginMeta
     * @memberof DbUtil
     */
    pluginLoad(
        pluginModule: Type,
        pluginMeta: PluginModuleMeta<DbPluginOption>,
    ) {
        const { database = {} } = pluginMeta;
        const meta: Required<Omit<ModuleMetadata, 'controllers'>> = {
            imports: [],
            providers: [],
            exports: [],
        };
        const { entities, repositories, subscribers } = database;
        if (entities) {
            entities.forEach((item) => {
                'use' in item
                    ? this.addEnititiesOrSubscribers(
                          [item.use],
                          'entity',
                          item.connection,
                      )
                    : this.addEnititiesOrSubscribers([item], 'entity');
            });
            meta.imports = entities.map((e) => {
                if ('use' in e) {
                    return e.connection === this._default
                        ? TypeOrmModule.forFeature([e.use])
                        : TypeOrmModule.forFeature([e.use], e.connection);
                }
                return TypeOrmModule.forFeature([e]);
            });
        }
        if (repositories) {
            this.addRepositories(repositories);
            const repoRegs = TypeOrmModule.forFeature(repositories);
            meta.imports = [...meta.imports, repoRegs];
            meta.exports = [repoRegs];
        }
        if (subscribers) {
            subscribers.forEach((item) => {
                'use' in item
                    ? this.addEnititiesOrSubscribers(
                          [item.use],
                          'subscriber',
                          item.connection,
                      )
                    : this.addEnititiesOrSubscribers([item], 'subscriber');
            });
        }
        this._pluginMeta.push({ module: pluginModule, meta });
    }

    /**
     * 添加模型或订阅者
     *
     * @protected
     * @template T
     * @template U
     * @param {Array<T>} data
     * @param {U} type
     * @param {string} [connection]
     * @memberof DbUtil
     */
    protected addEnititiesOrSubscribers<
        T extends EntityClassOrSchema | Type<any>,
        U extends 'entity' | 'subscriber'
    >(data: Array<T>, type: U, connection?: string) {
        const cname = connection ?? this._default;
        const dataKey = type === 'entity' ? 'entities' : 'subscribers';
        if (!this.options.find((item) => item.name === cname)) {
            throw new Error(`Connection named ${cname}'s option not exists!`);
        }
        this[dataKey][cname] = [
            ...(this[dataKey][cname] ?? []),
            ...(type === 'entity'
                ? [...data].map((e) => this.defineEntity(e))
                : [...data].map((s) =>
                      this.defineSubsciber(s as Type<any>, cname),
                  )),
        ];
    }

    protected addRepositories(repositories: EntityClassOrSchema[]) {
        this.repositories = [...this.repositories, ...repositories];
    }

    protected addFactories(factories: (() => DbFactoryOption<any, any>)[]) {
        for (const factory of factories) {
            const { entity, handler } = factory();
            this._factories[entity.name] = { entity, handler };
        }
    }
}
