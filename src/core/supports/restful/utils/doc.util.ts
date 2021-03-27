import { AppParams } from '@/core/common';
import { Type } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { omit, trim } from 'lodash';
import {
    APIDocOption,
    ApiDocSource,
    RouteOption,
    SwaggerOption,
    VersionOption,
} from '../types';
import { RouteUtil } from './route.util';

/**
 * API Util swagger文档处理
 *
 * @export
 * @abstract
 * @class DocUtil
 * @extends {RouteUtil}
 */
export abstract class DocUtil extends RouteUtil {
    /**
     * 文档列表
     *
     * @protected
     * @type {{
     *         [version: string]: APIDocOption;
     *     }}
     * @memberof DocUtil
     */
    protected _docs!: {
        [version: string]: APIDocOption;
    };

    /**
     * 排除已经添加的模块
     *
     * @protected
     * @type {string[]}
     * @memberof DocUtil
     */
    protected excludeVersionModules: string[] = [];

    get docs() {
        return this._docs;
    }

    /**
     * 创建文档
     *
     * @protected
     * @returns
     * @memberof ApiUtil
     */
    protected createDocs() {
        const versionMaps = Object.entries(this.config.versions);
        // console.log(JSON.stringify(this.config.versions, null, 4));
        const vDocs = versionMaps.map(([name, version]) => [
            name,
            this.getDocOption(name, version),
        ]);
        this._docs = Object.fromEntries(vDocs);
        const defaultVersion = this.config.versions[this._default];
        // 为默认版本再次生成一个文档
        this._docs.default = this.getDocOption(
            this._default,
            defaultVersion,
            true,
        );
    }

    /**
     * 生成版本文档配置
     *
     * @protected
     * @param {string} name
     * @param {VersionOption} voption
     * @param {boolean} [isDefault=false]
     * @return {*}
     * @memberof DocUtil
     */
    protected getDocOption(
        name: string,
        voption: VersionOption,
        isDefault = false,
    ) {
        const docConfig: APIDocOption = {};
        // 默认文档配置
        const defaultDoc = {
            title: voption.title!,
            description: voption.description!,
            tags: voption.tags ?? [],
            auth: voption.auth ?? false,
            version: name,
            path: trim(
                `${this.config.prefix?.doc}${isDefault ? '' : `/${name}`}`,
                '/',
            ),
        };
        // 获取路由文档
        const routesDoc = isDefault
            ? this.getRouteDocs(defaultDoc, voption.routes ?? [])
            : this.getRouteDocs(defaultDoc, voption.routes ?? [], name);
        if (Object.keys(routesDoc).length > 0) {
            docConfig.routes = routesDoc;
        }
        const flatModules = isDefault
            ? this.getFlatModule(voption.routes ?? [])
            : this.getFlatModule(voption.routes ?? [], name);
        // 文档所依赖的模块
        const include = this.filterExcludeModules(flatModules);
        // 版本DOC中有依赖的路由模块或者版本DOC中没有路由DOC则添加版本默认DOC
        if (include.length > 0 || !docConfig.routes) {
            docConfig.default = { ...defaultDoc, include };
        }
        return docConfig;
    }

    /**
     * 排除已经添加的模块
     *
     * @protected
     * @param {Type<any>[]} flatModules
     * @return {*}
     * @memberof DocUtil
     */
    protected filterExcludeModules(flatModules: Type<any>[]) {
        const excludeModules: Type<any>[] = [];
        const excludeNames = Array.from(new Set(this.excludeVersionModules));
        for (const [name, module] of Object.entries(this._modules)) {
            if (excludeNames.includes(name)) excludeModules.push(module);
        }
        return flatModules.filter(
            (fmodule) => !excludeModules.find((emodule) => emodule === fmodule),
        );
    }

    /**
     * 生成路由文档
     *
     * @protected
     * @param {Omit<SwaggerOption, 'include'>} option
     * @param {RouteOption[]} routes
     * @param {string} [parent]
     * @return {*}  {{ [key: string]: SwaggerOption }}
     * @memberof DocUtil
     */
    protected getRouteDocs(
        option: Omit<SwaggerOption, 'include'>,
        routes: RouteOption[],
        parent?: string,
    ): { [key: string]: SwaggerOption } {
        /**
         * 合并Doc配置
         *
         * @param {Omit<SwaggerOption, 'include'>} vDoc
         * @param {RouteOption} route
         */
        const mergeDoc = (
            vDoc: Omit<SwaggerOption, 'include'>,
            route: RouteOption,
        ) => ({
            ...vDoc,
            ...route.doc,
            tags: Array.from(
                new Set([...(vDoc.tags ?? []), ...(route.doc?.tags ?? [])]),
            ),
            path: this.genDocPath(route.path, parent),
            include: this.getFlatModule([route], parent),
        });
        let routeDocs: { [key: string]: SwaggerOption } = {};

        // 判断路由是否有除tags之外的其它doc属性
        const hasAdditional = (doc?: ApiDocSource) =>
            doc && Object.keys(omit(doc, 'tags')).length > 0;

        for (const route of routes) {
            const { name, doc, children } = route;
            const moduleName = parent ? `${parent}.${name}` : name;

            // 加入在版本DOC中排除模块列表
            if (hasAdditional(doc) || parent)
                this.excludeVersionModules.push(moduleName);

            // 添加到routeDocs中
            if (hasAdditional(doc)) {
                routeDocs[
                    moduleName.replace(`${option.version}.`, '')
                ] = mergeDoc(option, route);
            }
            if (children) {
                routeDocs = {
                    ...routeDocs,
                    ...this.getRouteDocs(option, children, moduleName),
                };
            }
        }
        return routeDocs;
    }

    /**
     * 格式化文档URL路径
     *
     * @protected
     * @param {string} routePath
     * @param {string} [version]
     * @return {*}
     * @memberof DocUtil
     */
    protected genDocPath(routePath: string, version?: string) {
        return this.trimPath(
            `${this.config.prefix?.doc}${
                version ? `/${version.toLowerCase()}/` : '/'
            }${routePath}`,
            false,
        );
    }

    /**
     * 整合swagger
     *
     * @param {INestApplication} instance
     * @return {*}
     * @memberof DocUtil
     */
    onCreated({ current }: Required<AppParams>) {
        const docs = Object.values(this._docs)
            .map((vdoc) => [vdoc.default, ...Object.values(vdoc.routes ?? {})])
            .reduce((o, n) => [...o, ...n], [])
            .filter((i) => !!i);
        for (const voption of docs) {
            const {
                title,
                description,
                version,
                auth,
                include,
                tags,
            } = voption!;
            const builder = new DocumentBuilder();
            if (title) builder.setTitle(title);
            if (description) builder.setDescription(description);
            if (auth) builder.addBearerAuth();
            if (tags) {
                tags.forEach((tag) => builder.addTag(tag));
            }
            builder.setVersion(version);
            const document = SwaggerModule.createDocument(
                current,
                builder.build(),
                {
                    include: include.length > 0 ? include : [() => undefined],
                },
            );
            SwaggerModule.setup(voption!.path, current, document);
        }
    }
}
