import { Type } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { camelCase, upperFirst } from 'lodash';
import { Route, Routes } from 'nest-router';
import { CreateModule } from '../../../common';
import { CONTROLLER_DEPENDS } from '../constants';
import { RouteOption } from '../types';
import { ApiBaseUtil } from './base.util';

/**
 * API Util路由处理
 *
 * @export
 * @abstract
 * @class RouteUtil
 * @extends {ApiBaseUtil}
 */
export abstract class RouteUtil extends ApiBaseUtil {
    protected _routes: Routes = [];

    get routes() {
        return this._routes;
    }

    /**
     * 创建路由树
     *
     * @protected
     * @memberof ApiUtil
     */
    protected createRoutes() {
        /**
         * 对路由进一步处理
         *
         * 为所有路由自动生成RouteModule
         * 获取Controller的依赖模块
         *
         * @param {RouteOption[]} routes
         * @param {string} [parentModule]
         * @return {*}  {Routes}
         */
        const resolveRoutes = (
            routes: RouteOption[],
            parentModule?: string,
        ): Routes =>
            routes.map(({ name, path, children, controllers, doc }) => {
                // 自动创建路由模块的名称
                const moduleName = parentModule
                    ? `${parentModule}.${name}`
                    : name;
                // RouteModule的名称必须唯一
                if (Object.keys(this._modules).includes(moduleName)) {
                    throw new Error(
                        'route name should be unique in same level!',
                    );
                }
                // 获取每个控制器的依赖模块
                const depends = controllers
                    .map(
                        (c) => Reflect.getMetadata(CONTROLLER_DEPENDS, c) || [],
                    )
                    .reduce((o: Type<any>[], n) => {
                        if (o.find((i) => i === n)) return o;
                        return [...o, ...n];
                    }, []);

                // 为每个没有自己添加`ApiTags`装饰器的控制器添加Tag
                if (doc?.tags && doc.tags.length > 0) {
                    controllers.forEach(
                        (controller) =>
                            !Reflect.getMetadata(
                                'swagger/apiUseTags',
                                controller,
                            ) && ApiTags(...doc.tags!)(controller),
                    );
                }
                // 创建路由模块,并导入所有控制器的依赖模块
                const module = CreateModule(
                    `${upperFirst(camelCase(name))}RouteModule`,
                    () => ({
                        controllers,
                        imports: depends,
                    }),
                );
                // 在_modules属性中放入创建的RouteModule,防止重名
                this._modules[moduleName] = module;
                const route: Route = { path, module };
                // 如果有子路由则进一步处理
                if (children)
                    route.children = resolveRoutes(children, moduleName);
                return route;
            });
        const versionMaps = Object.entries(this.config.versions);

        // 对每个版本的路由使用'resolveRoutes'方法进行处理
        this._routes = versionMaps
            .map(([name, version]) =>
                resolveRoutes(version.routes ?? [], name).map((route) => ({
                    ...route,
                    path: this.genRoutePath(route.path, name),
                })),
            )
            .reduce((o, n) => [...o, ...n], []);
        // 生成一个默认省略版本号的路由
        const defaultVersion = this.config.versions[this._default];
        this._routes = [
            ...this._routes,
            ...resolveRoutes(defaultVersion.routes ?? []).map((route) => ({
                ...route,
                path: this.genRoutePath(route.path),
            })),
        ];
    }

    /**
     * 生成路由URL
     *
     * @protected
     * @param {string} routePath
     * @param {string} [version]
     * @return {*}
     * @memberof RouteUtil
     */
    protected genRoutePath(routePath: string, version?: string) {
        return this.trimPath(
            `${this.config.prefix?.route}${
                version ? `/${version.toLowerCase()}/` : '/'
            }${routePath}`,
        );
    }
}
