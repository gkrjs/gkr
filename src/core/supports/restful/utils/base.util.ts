import { Type } from '@nestjs/common';
import { omit, pick, trim } from 'lodash';
import { BaseUtil, UtilConfigMaps } from '../../../common';
import { ApiConfig, RouteOption } from '../types';

/**
 * API Util配置处理
 *
 * @export
 * @abstract
 * @class ApiBaseUtil
 * @extends {BaseUtil<ApiConfig>}
 */
export abstract class ApiBaseUtil extends BaseUtil<ApiConfig> {
    protected configMaps: UtilConfigMaps = {
        required: true,
        maps: 'api',
    };

    /**
     * 默认API版本号
     *
     * @protected
     * @type {string}
     * @memberof ApiBaseUtil
     */
    protected _default!: string;

    /**
     * 启用的API版本
     *
     * @protected
     * @type {string[]}
     * @memberof ApiBaseUtil
     */
    protected _versions: string[] = [];

    /**
     * 自动创建的RouteModule
     *
     * @protected
     * @type {{ [key: string]: Type<any> }}
     * @memberof ApiBaseUtil
     */
    protected _modules: { [key: string]: Type<any> } = {};

    get default() {
        return this._default;
    }

    get versions() {
        return this._versions;
    }

    get modules() {
        return this._modules;
    }

    create(_config: ApiConfig) {}

    /**
     * 创建配置
     *
     * @protected
     * @param {ApiConfig} config
     * @memberof ApiBaseUtil
     */
    protected createConfig(config: ApiConfig) {
        /**
         * 格式化路由(path和children)
         *
         * @param {RouteOption[]} data
         * @return {*}  {RouteOption[]}
         */
        const configRoutes = (data: RouteOption[]): RouteOption[] =>
            data.map((option) => {
                const route: RouteOption = {
                    ...omit(option, 'children'),
                    path: this.trimPath(option.path),
                };
                if (option.children && option.children.length > 0) {
                    route.children = configRoutes(option.children);
                } else {
                    delete route.children;
                }
                return route;
            });

        if (!config.default) {
            throw new Error('default api version name should been config!');
        }
        const versionMaps = Object.entries(config.versions)
            // 过滤启用的版本
            .filter(([name]) => {
                if (config.default === name) return true;
                return config.enabled.includes(name);
            })
            // 合并版本配置与总配置
            .map(([name, version]) => [
                name,
                {
                    ...pick(config, ['title', 'description', 'auth']),
                    ...version,
                    tags: Array.from(
                        new Set([
                            ...(config.tags ?? []),
                            ...(version.tags ?? []),
                        ]),
                    ),
                    routes: configRoutes(version.routes ?? []),
                },
            ]);

        config.versions = Object.fromEntries(versionMaps);
        // 设置所有版本号
        this._versions = Object.keys(config.versions);
        // 设置默认版本号
        this._default = config.default;
        // 启用的版本中必须包含默认版本
        if (!this._versions.includes(this._default)) {
            throw new Error(
                `Default api version named ${this._default} not exists!`,
            );
        }
        this.config = config;
    }

    /**
     * 过滤URL路径
     *
     * @protected
     * @param {string} routePath
     * @param {boolean} [addPrefix=true]
     * @return {*}
     * @memberof ApiBaseUtil
     */
    protected trimPath(routePath: string, addPrefix = true) {
        return `${addPrefix ? '/' : ''}${trim(
            routePath.replace('//', '/'),
            '/',
        )}`;
    }

    /**
     * 获取路由列表中所有依赖的自动生成模块
     *
     * @protected
     * @param {RouteOption[]} routes
     * @param {string} [parent]
     * @return {*}
     * @memberof ApiBaseUtil
     */
    protected getFlatModule(routes: RouteOption[], parent?: string) {
        const result = routes
            .map(({ name, children }) => {
                const routeName = parent ? `${parent}.${name}` : name;
                let modules: Type<any>[] = [this._modules[routeName]];
                if (children)
                    modules = [
                        ...modules,
                        ...this.getFlatModule(children, routeName),
                    ];
                return modules;
            })
            .reduce((o, n) => [...o, ...n], [])
            .filter((i) => !!i);
        return result;
    }
}
