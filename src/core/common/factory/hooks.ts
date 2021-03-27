import { Type } from '@nestjs/common';
import { PLUGIN_MODULE_REGISTER } from '../constants';
import { AppParams, CreateOptions, PluginModuleMeta } from '../types';

export function loadPlugins(
    plugins: Type<any>[],
    params: AppParams,
    hooks: CreateOptions['hooks'],
) {
    const { utiler } = params;
    const loaded = plugins.map((plugin) => {
        const metaRegister = Reflect.getMetadata(
            PLUGIN_MODULE_REGISTER,
            plugin,
        );
        const pluginMeta: PluginModuleMeta = metaRegister ? metaRegister() : {};
        if (hooks?.pluginLoad) {
            hooks.pluginLoad({
                ...params,
                plugin,
                meta: pluginMeta,
            });
        }
        if (pluginMeta.utils && pluginMeta.utils.length > 0) {
            utiler.add(...pluginMeta.utils);
        }
        return { use: plugin, meta: pluginMeta };
    });
    loaded.forEach(({ use, meta }) => {
        if (meta.utils && meta.utils.length > 0) {
            meta.utils.forEach((u) => utiler.get(u).onPluginLoad(use, meta));
        }
    });
    return loaded;
}

export async function created(
    params: Required<AppParams>,
    hooks: CreateOptions['hooks'],
) {
    const { utiler, plugins } = params;
    if (hooks?.created) {
        await hooks.created(params);
    }
    await Promise.all(
        utiler.all().map(async ({ value }) => value.onCreated(params)),
    );
    await Promise.all(
        plugins.map(async ({ meta }) => {
            if (meta.hooks?.created) await meta.hooks?.created(params);
        }),
    );
}
