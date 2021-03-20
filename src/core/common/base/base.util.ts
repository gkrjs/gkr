import { ModuleMetadata, Type } from '@nestjs/common';
import { set } from 'lodash';
import { Configure } from '../../configure/configure';
import {
    AppParams,
    CommandItem,
    PluginModuleMeta,
    UtilConfigMaps,
} from '../types';

/**
 * Util基类
 * 所有工具都应该继承此类
 *
 * @export
 * @abstract
 * @class BaseUtil
 * @template CT
 */
export abstract class BaseUtil<CT> {
    protected _created = false;

    protected configure!: Configure;

    /**
     * 子类配置
     *
     * @protected
     * @type {CT}
     * @memberof BaseUtil
     */
    protected config!: CT;

    /**
     * 配置映射
     *
     * @protected
     * @abstract
     * @type {UtilConfigMaps}
     * @memberof BaseUtil
     */
    protected abstract configMaps?: UtilConfigMaps;

    /**
     * 是否初始化
     *
     * @return {*}
     * @memberof BaseUtil
     */
    isCreated() {
        return this._created;
    }

    /**
     * 始化Util类
     * 将映射后的配置放入子类的factory进行进一步操作
     * 比如赋值给this.config
     *
     * @memberof BaseUtil
     */
    factory(configure: Configure) {
        this.configure = configure;
        if (!this._created) {
            this.create(this.mapConfig());
            this._created = true;
        }
    }

    /**
     * 由子类根据配置初始化
     *
     * @protected
     * @abstract
     * @param {*} config
     * @memberof BaseUtil
     */
    protected abstract create(config: any): void;

    globalMeta(): Omit<ModuleMetadata, 'controllers'> {
        return {};
    }

    pluginMeta(plugin: Type): Omit<ModuleMetadata, 'controllers'> {
        return {};
    }

    pluginLoad<T>(pluginModule: Type, pluginMeta: PluginModuleMeta<T>) {}

    created(params: Required<AppParams>): Promise<void> | void {}

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    closed(): Promise<void> | void {}

    listend(params: Required<AppParams>): boolean {
        return false;
    }

    commands(): Array<CommandItem<any, any>> {
        return [];
    }

    /**
     * 根据configMaps获取映射后的配置
     * 如果configs是一个string则直接在获取其在配置池中的值
     * 如果configs是一个对象则获取后再一一映射
     *
     * @private
     * @return {*}
     * @memberof BaseUtil
     */
    private mapConfig() {
        if (this.configMaps?.maps) {
            const { maps, required } = this.configMaps;
            if (typeof maps === 'string') {
                return this.checkAndGetConfig(maps, maps, required);
            }
            const mapSet = {};
            for (const [name, slug] of Object.entries(maps!)) {
                set(mapSet, name, this.checkAndGetConfig(name, slug, required));
            }
            return mapSet;
        }
        return {};
    }

    /**
     * 检测并获取配置
     * 如果required为true则检测每个配置在配置池中是否存在
     * 如果required为数组则只把数组中的值作为key去检测它们在配置池中是否存在
     * 其它情况不检测
     *
     * @protected
     * @param {string} name
     * @param {string} key
     * @param {UtilConfigMaps['required']} [required]
     * @return {*}
     * @memberof BaseUtil
     */
    protected checkAndGetConfig(
        name: string,
        key: string,
        required?: UtilConfigMaps['required'],
    ) {
        const data = this.configure.get(key, undefined);
        if (required && typeof data !== 'boolean' && !data) {
            const msg = `config for ${key} is incorrect ！`;
            if (typeof required === 'boolean' && required) {
                throw new Error(msg);
            }
            if (required instanceof Array && required.includes(name)) {
                throw new Error(msg);
            }
        }
        return data;
    }
}
