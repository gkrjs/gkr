import { ConnectionUtil, isInSource, UtilConfigMaps } from '@/core/common';
import { ModuleMetadata, Type } from '@nestjs/common';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import merge from 'deepmerge';
import path from 'path';
import { ADDTIONAL_RELATIONS } from '../constants';
import {
    DatabaseConfig,
    DbFactoryOption,
    DbOption,
    DynamicRelation,
    FactoryOptions,
} from '../types';
/**
 * 数据库工具类
 *
 * @export
 * @class DataBasePlugin
 */
export abstract class BaseDbUtil extends ConnectionUtil<
    DatabaseConfig,
    DbOption
> {
    protected name = 'database';

    protected entities: {
        [connectionName: string]: EntityClassOrSchema[];
    } = {};

    protected repositories: EntityClassOrSchema[] = [];

    protected subscribers: {
        [connectionName: string]: Type<any>[];
    } = {};

    protected _factories: FactoryOptions = {};

    protected configMaps: UtilConfigMaps = {
        required: true,
        maps: 'database',
    };

    protected _pluginMeta: Array<{
        module: Type<any>;
        meta: Required<Omit<ModuleMetadata, 'controllers'>>;
    }> = [];

    get factories() {
        return this._factories;
    }

    protected defineEntity(entity: EntityClassOrSchema) {
        const relationsRegister = Reflect.getMetadata(
            ADDTIONAL_RELATIONS,
            entity,
        );
        if (
            'prototype' in entity &&
            relationsRegister &&
            typeof relationsRegister === 'function'
        ) {
            const relations: DynamicRelation[] = relationsRegister();
            relations.forEach(({ column, relation }) => {
                const cProperty = Object.getOwnPropertyDescriptor(
                    entity.prototype,
                    column,
                );
                if (!cProperty) {
                    Object.defineProperty(entity.prototype, column, {
                        writable: true,
                    });
                    relation(entity, column);
                }
            });
        }
        return entity;
    }

    protected defineSubsciber(Sub: Type<any>, cname?: string) {
        Object.defineProperty(Sub.prototype, 'cname', {
            value: cname,
            writable: true,
        });
        return Sub;
    }

    /**
     * 获取用于TypeOrmModule的数据库连接的配置
     * 设置autoLoadEntities为true,使entity在autoLoadEntities后自动加载
     * 由于entity在autoLoadEntities后自动加载,subscriber由提供者方式注册
     * 所以在配置中去除这两者
     *
     * @returns
     * @memberof Database
     */
    getNestOptions() {
        const options = this.getOptions().map((option) => {
            const all = {
                ...option,
                keepConnectionAlive: true,
                autoLoadEntities: true,
            };
            const {
                migrations,
                subscribers,
                entities,
                name,
                ...nestOption
            } = all;
            const cname =
                option.name === this._default ? undefined : option.name;
            return {
                ...nestOption,
                name: cname,
                subscribers: (subscribers ?? []).map((s) =>
                    this.defineSubsciber(s as Type<any>, cname),
                ),
            };
        }) as TypeOrmModuleOptions[];
        return options;
    }

    /**
     * 根据名称获取一个用于TypeOrmModule的数据库连接的配置
     * 没有名称则获取默认配置
     *
     * @param {string} [name]
     * @returns
     * @memberof Database
     */
    getNestOption(name?: string) {
        const option = this.getNestOptions().find((item) => item.name === name);
        if (!option) {
            throw new Error(`Connection named ${name}'s option not exists!`);
        }
        return option;
    }

    protected abstract addFactories(
        factories: (() => DbFactoryOption<any, any>)[],
    ): void;

    protected setOptions() {
        super.setOptions();
        this._options = this._options.map((option) => {
            const common = merge(
                {
                    paths: {
                        migrations: 'migration',
                    },
                },
                this.config.common,
            );
            return merge(common, option as Record<string, any>) as DbOption;
        });
        this._options.forEach(({ name }) => {
            this.entities[name] = [];
            this.subscribers[name] = [];
        });
    }

    protected getOptions<T extends DbOption = DbOption>(): T[] {
        return super.getOptions().map((option) => {
            const mgPath = path.join(
                option.paths?.migration ?? 'src/database/migration',
                option.name,
            );
            if (option.factories) {
                this.addFactories(option.factories);
            }
            return {
                ...option,
                synchronize: false,
                entities: this.entities[option.name],
                subscribers: this.subscribers[option.name] as any[],
                migrations: isInSource()
                    ? [path.join(mgPath, '**/*{.ts,.js}')]
                    : option.migrations,
            } as T;
        });
    }
}
