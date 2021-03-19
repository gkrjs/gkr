import { Global, Module, ModuleMetadata, Type } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import merge from 'deepmerge';
import { isArray, isObject, pick } from 'lodash';
import { Configure } from '../../configure/configure';
import { CreateModule } from '../helpers';
import { AppFilter, AppIntercepter, AppPipe } from '../providers';
import { AppParams, CreateOptions, PluginModuleMeta } from '../types';

const metaKeys = [
    'imports',
    'providers',
    'exports',
    'controllers',
] as (keyof ModuleMetadata)[];

/**
 * 合并两个模块元数据配置
 *
 * @param {PluginModuleMeta} meta
 * @param {PluginModuleMeta} custom
 * @return {*}
 */
export function mergeMeta(meta: PluginModuleMeta, custom: PluginModuleMeta) {
    const keys = Array.from(
        new Set([...Object.keys(meta), ...Object.keys(custom)]),
    );
    const useMerge = <T extends any>(i: T, p: T) => {
        if (isArray(p)) {
            return [...((i as any[]) ?? []), ...((p as any[]) ?? [])];
        }
        if (isObject(p)) {
            return merge(i as Record<string, any>, p as Record<string, any>, {
                arrayMerge: (_d, s, _o) => s,
            });
        }
        return p;
    };
    const merged = Object.fromEntries(
        keys
            .map((type) => [type, useMerge(meta[type], custom[type])])
            .filter(([_, item]) => (isArray(item) ? item.length > 0 : !!item)),
    );
    return { ...meta, ...merged };
}

/**
 * 创建全局核心模块
 *
 * @param {() => ModuleMetadata} [metaGetter]
 * @return {*}  {Type<any>}
 */
function createGlobalModule(
    appParams: AppParams,
    metaGetter?: (params: AppParams) => ModuleMetadata,
): Type<any> {
    const GlobalModule = CreateModule('GlobalModule', () => {
        const { configure, utiler } = appParams;
        const utils = utiler.all().map((u) => u.use);
        let meta: ModuleMetadata = {
            providers: [
                {
                    provide: Configure,
                    useValue: configure,
                },
                {
                    provide: APP_PIPE,
                    useFactory: () =>
                        new AppPipe({
                            transform: true,
                            forbidUnknownValues: true,
                            validationError: { target: false },
                        }),
                },
                {
                    provide: APP_FILTER,
                    useClass: AppFilter,
                },
                {
                    provide: APP_INTERCEPTOR,
                    useClass: AppIntercepter,
                },
                ...utils.map((u) => utiler.provider(u)),
            ],
            exports: [...utils, Configure],
        };
        if (metaGetter) {
            meta = mergeMeta(meta, metaGetter(appParams));
        }
        return meta;
    });
    Global()(GlobalModule);
    return GlobalModule;
}

/**
 * 创建插件模块
 *
 * @param {Type<any>[]} plugins
 * @param {PluginMetaGetter} [metaGetter]
 * @return {*}  {Type<any>[]}
 */
function createPluginModules(
    plugins: Array<{ use: Type; meta: PluginModuleMeta }>,
    metaGetter?: (
        plugin: Type<any>,
        meta: PluginModuleMeta,
    ) => PluginModuleMeta,
): Type<any>[] {
    return plugins.map((plugin) => {
        // const metaRegister = Reflect.getMetadata(
        //     PLUGIN_MODULE_REGISTER,
        //     plugin,
        // );
        // let meta: PluginModuleMeta = metaRegister ? metaRegister() : {};
        if (metaGetter) {
            plugin.meta = mergeMeta(
                plugin.meta,
                metaGetter(plugin.use, plugin.meta),
            );
        }

        Module(pick(plugin.meta, metaKeys))(plugin.use);
        return plugin.use;
    });
}

/**
 * 创建启动模块
 *
 * @export
 * @param {CreateOptions['meta']} metaGetter
 * @param {Type<any>[]} [plugins=[]]
 * @return {*}  {Type<any>}
 */
export function createBootModule(
    appParams: AppParams,
    metaGetter: CreateOptions['meta'],
    plugins: Array<{ use: Type; meta: PluginModuleMeta }>,
): Type<any> {
    const { global: globalGetter, plugin: pluginGetter } = metaGetter ?? {};
    const GlobalModule = createGlobalModule(appParams, globalGetter);
    const modules = createPluginModules(
        plugins,
        pluginGetter
            ? (plugin: Type<any>, meta: PluginModuleMeta) =>
                  pluginGetter({
                      plugin,
                      meta,
                      ...appParams,
                  })
            : undefined,
    );
    return CreateModule('BootModule', () => {
        let meta: ModuleMetadata = {
            imports: [GlobalModule, ...modules],
        };
        if (metaGetter?.boot) {
            meta = mergeMeta(meta, metaGetter.boot(appParams));
        }
        return meta;
    });
}
