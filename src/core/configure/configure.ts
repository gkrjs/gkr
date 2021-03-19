import merge from 'deepmerge';
import { get, has } from 'lodash';
import { loadEnvs } from './env';
import { BaseConfig, ConfigRegCollection } from './types';

// 默认app配置
const defaultConfigs: BaseConfig = {
    app: {
        timezone: 'UTC',
        locale: 'en',
        debug: true,
        port: 3000,
        host: 'localhost',
        https: false,
    },
};

/**
 * 核心配置类
 *
 * @export
 * @class Configure
 * @template T
 */
export class Configure<T extends BaseConfig = BaseConfig> {
    /**
     * 是否已经初始化
     *
     * @protected
     * @memberof Configure
     */
    protected _created = false;

    /**
     * 根据配置注册器生成的配置
     *
     * @protected
     * @type {{ [key: string]: any }}
     * @memberof Configure
     */
    protected _config!: { [key: string]: any };

    /**
     * 配置注册器集合
     *
     * @protected
     * @type {ConfigRegCollection<T>}
     * @memberof Configure
     */
    protected _registers!: ConfigRegCollection<T>;

    /**
     * 根据传入的配置构造器对象集生成所有配置
     *
     * @param {ConfigRegCollection<T>} _config
     * @memberof Configure
     */
    create(_config: ConfigRegCollection<T>) {
        if (!this._created) {
            this.reset(_config);
        }
    }

    /**
     * 判断是否创建
     *
     * @readonly
     * @memberof Configure
     */
    get created() {
        return this._created;
    }

    /**
     * 获取一个配置,不存在则返回defaultValue
     *
     * @template CT
     * @param {string} key
     * @param {CT} [defaultValue]
     * @returns
     * @memberof Configure
     */
    get<CT extends any = any>(key: string, defaultValue?: CT) {
        if (!has(this._config, key) && defaultValue === undefined) {
            return undefined;
        }
        return get(this._config, key, defaultValue) as CT;
    }

    /**
     * 判断一个配置是否存在
     *
     * @static
     * @param {string} key
     * @returns {boolean}
     * @memberof Configure
     */
    has(key: string): boolean {
        return has(this._config, key);
    }

    /**
     * 获取所有配置
     *
     * @template CT
     * @returns
     * @memberof Configure
     */
    all<CT extends T = T>() {
        return this._config as CT;
    }

    /**
     * 加载环境变量并重置所有配置
     *
     * @protected
     * @param {ConfigRegCollection<T>} _config
     * @memberof Configure
     */
    protected reset(_config: ConfigRegCollection<T>) {
        loadEnvs();
        this._config = this.loadConfig(_config);
        this._created = true;
    }

    /**
     * 执行每个配置注册器并创建所有配置
     *
     * @protected
     * @param {ConfigRegCollection<T>} _config
     * @returns
     * @memberof Configure
     */
    protected loadConfig(_config: ConfigRegCollection<T>) {
        const customConfigs = Object.fromEntries(
            Object.entries(_config).map(([name, value]) => [name, value()]),
        );
        const config = merge(defaultConfigs, customConfigs, {
            arrayMerge: (_d, s, _o) => s,
        }) as T;
        if (!config.app.url) {
            config.app.url = `${config.app.https ? 'https' : 'http'}://${config
                .app.host!}:${config.app.port}`;
        }
        return config;
    }
}
