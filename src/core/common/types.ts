import { INestApplication, ModuleMetadata, Type } from '@nestjs/common';
import { CommandModule } from 'yargs';
import { Configure } from '../configure/configure';
import { ConfigRegCollection } from '../configure/types';
import { BaseUtil } from './base';
import { Utiler } from './utiler';
/**
 * 一个类的类型
 */
export type ClassType<T extends {}> = { new (...args: any[]): T };
/**
 * 获取数组中元素的类型
 */
export type ArrayItem<A> = A extends readonly (infer T)[] ? T : never;
/**
 * 递归必选
 */
export type ReRequired<T> = {
    [P in keyof T]: NonNullable<ReRequired<T[P]>>;
};
/**
 * 递归可选
 */
export type RePartial<T> = {
    [P in keyof T]?: RePartial<T[P]>;
};
/**
 * 过滤类型,去除U中T不包含的类型
 */
export type Filter<T, U> = T extends U ? T : never;

/**
 * 反向过滤类型,去除U中T包含的类型
 */
export type Diff<T, U> = T extends U ? never : T;

/**
 * 获取一个对象的值类型
 */
export type ValueOf<T> = T[keyof T];

/**
 * 获取不同类组成的数组的类型
 */
export type ClassesType<T extends Array<any>> = {
    new (...args: any[]): T[number];
}[];

/**
 * 嵌套对象
 */
export type NestedRecord = Record<string, Record<string, any>>;
/**
 * 分页验证DTO接口
 *
 * @export
 * @interface PaginateDto
 */
export interface PaginateDto {
    page: number;
    limit: number;
}

/**
 * 配置与Util映射
 *
 * @export
 * @interface UtilConfigMaps
 */
export interface UtilConfigMaps {
    required?: boolean | string[];
    maps?: { [key: string]: string } | string;
}

export type CUtilConfigType<
    O extends CUtilOptionType<Record<string, any>>,
    T extends Record<string, any> = Record<string, any>
> = T & {
    default?: string;
    enabled: string[];
    connections: O[];
};
export type CUtilOptionType<T extends Record<string, any>> = T & {
    name: string;
};

export type AppParams = {
    configure: Configure;
    utiler: Utiler;
    current?: INestApplication;
};

/**
 * 插件模块的元数据配置函数
 *
 * @export
 * @interface PluginMetaGetter
 */
export interface PluginMetaGetter {
    (
        params: AppParams & { plugin: Type<any>; meta: PluginModuleMeta },
    ): PluginModuleMeta;
}
/**
 * APP创建器选项
 *
 * @export
 * @interface CreateOptions
 */
export interface CreateOptions {
    configs: ConfigRegCollection<Record<string, any>>;
    plugins: Type<any>[];
    factory: AppFactory;
    utils?: Array<ClassType<BaseUtil<any>>>;
    hooks?: {
        inited?: (params: AppParams) => void | Promise<void>;
        pluginLoad?: (
            params: AppParams & { plugin: Type; meta: PluginModuleMeta },
        ) => void;
        created?: (
            params: Required<AppParams>,
        ) => INestApplication | Promise<INestApplication>;
        listend?: (params: Required<AppParams>) => boolean;
        closed?: (params: Required<AppParams>) => Promise<void>;
    };
    meta?: (params: AppParams) => ModuleMetadata;
    commands?: () => CommandCollection;
}

/**
 * App构造器
 *
 * @export
 * @interface Creator
 */
export interface CreatorData extends Required<AppParams> {
    commands: Array<CommandModule<any, any>>;
    hooks: CreateOptions['hooks'];
}
export interface Creator {
    (): Promise<CreatorData>;
}
/**
 * App实例化函数
 *
 * @export
 * @interface AppFactory
 */
export interface AppFactory {
    (params: {
        configure: Configure;
        BootModule: Type<any>;
    }): Promise<INestApplication>;
}

/**
 * 插件模块的Meta配置
 */
export type PluginModuleMeta<
    T extends Record<string, any> = Record<string, any>
> = ModuleMetadata & {
    utils?: Array<ClassType<BaseUtil<any>>>;
} & T;

export type CommandItem<T = {}, U = {}> = (
    params: Required<AppParams>,
    hooks?: CreateOptions['hooks'],
) => CommandModule<T, U>;

export type CommandCollection = Array<CommandItem<any, any>>;
