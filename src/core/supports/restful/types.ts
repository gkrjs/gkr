import { Type } from '@nestjs/common';

/**
 * API配置
 *
 * @export
 * @interface ApiConfig
 * @extends {ApiDocSource}
 */
export interface ApiConfig extends ApiDocSource {
    prefix?: {
        route?: string;
        doc?: string;
    };
    default: string;
    enabled: string[];
    versions: Record<string, VersionOption>;
}

/**
 * 版本配置
 *
 * @export
 * @interface VersionOption
 * @extends {ApiDocSource}
 */
export interface VersionOption extends ApiDocSource {
    routes?: RouteOption[];
}

/**
 * 路由配置
 *
 * @export
 * @interface RouteOption
 */
export interface RouteOption {
    name: string;
    path: string;
    controllers: Type<any>[];
    children?: RouteOption[];
    doc?: ApiDocSource;
}

/**
 * swagger选项
 *
 * @export
 * @interface SwaggerOption
 * @extends {ApiDocSource}
 */
export interface SwaggerOption extends ApiDocSource {
    version: string;
    path: string;
    include: Type<any>[];
}

/**
 * API与swagger整合的选项
 *
 * @export
 * @interface APIDocOption
 */
export interface APIDocOption {
    default?: SwaggerOption;
    routes?: { [key: string]: SwaggerOption };
}

/**
 * 总配置,版本,路由中用于swagger的选项
 *
 * @export
 * @interface ApiDocSource
 */
export interface ApiDocSource {
    title?: string;
    description?: string;
    auth?: boolean;
    tags?: string[];
}
