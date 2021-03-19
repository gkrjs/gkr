import { PLUGIN_MODULE_REGISTER } from '../constants';
import { PluginModuleMeta } from '../types';

/**
 * 插件类型模块的装饰器
 *
 * @export
 * @template T
 * @param {() => PluginModuleMeta<T>} register
 * @return {*}
 */
export function PluginModule<T extends Record<string, any>>(
    register: () => PluginModuleMeta<T>,
) {
    return <M extends new (...args: any[]) => any>(target: M) => {
        Reflect.defineMetadata(PLUGIN_MODULE_REGISTER, register, target);
        return target;
    };
}
