/**
 * app配置
 */
export interface AppConfig {
    debug: boolean;
    timezone: string;
    locale: string;
    port: number;
    https: boolean;
    host: string;
    url?: string;
}

/**
 * 基础配置
 *
 * @export
 * @interface BaseConfig
 */
export interface BaseConfig {
    app: AppConfig;
    [key: string]: any;
}

// 配置注册器函数
export type ConfigRegister<T> = () => T;
// 多个配置注册器集合
export type ConfigRegCollection<T> = {
    [P in keyof T]?: () => T[P];
};
