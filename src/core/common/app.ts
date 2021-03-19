import { INestApplication } from '@nestjs/common';
import { useContainer } from 'typeorm';
import { CommandModule } from 'yargs';
import { Configure } from '../configure/configure';
import { ConfigRegCollection } from '../configure/types';
import {
    buildCommands,
    createBootModule,
    created,
    getCommands,
    loadPlugins,
} from './factory';
import { AppParams, CreateOptions, Creator } from './types';
import { Utiler } from './utiler';

/**
 * App构造器
 *
 * @export
 * @class App
 */
export class App {
    /**
     * 当前创建的APP实例
     *
     * @protected
     * @static
     * @type {INestApplication}
     * @memberof App
     */
    protected static current: INestApplication;

    /**
     * 初始化后配置器实例
     *
     * @protected
     * @static
     * @type {Configure}
     * @memberof App
     */
    protected static _configure: Configure;

    /**
     * Utiler管理器实例
     *
     * @protected
     * @static
     * @type {Utiler}
     * @memberof App
     */
    protected static _utiler: Utiler;

    protected static _commands: Array<CommandModule<any, any>> = [];

    /**
     * 实例化Configure并根据配置初始化
     *
     * @protected
     * @static
     * @param {ConfigRegCollection<Record<string, any>>} configs
     * @memberof App
     */
    protected static config(configs: ConfigRegCollection<Record<string, any>>) {
        this._configure = new Configure();
        this._configure.create(configs);
        this._utiler = new Utiler(this._configure);
    }

    /**
     * 获取初始化后Configure实例
     *
     * @readonly
     * @static
     * @memberof App
     */
    static get configure() {
        return this._configure;
    }

    /**
     * 获取Util管理器
     *
     * @readonly
     * @static
     * @memberof App
     */
    static get utiler() {
        return this._utiler;
    }

    static get commands() {
        return this._commands;
    }

    /**
     * 获取当前app实例
     *
     * @static
     * @return {*}
     * @memberof App
     */
    static get(): INestApplication {
        return this.current;
    }

    /**
     * 根据选项参数返回App构造器函数
     *
     * @static
     * @param {CreateOptions} createOptions
     * @return {*}  {Creator}
     * @memberof App
     */
    static create(createOptions: CreateOptions) {
        return async () => {
            const {
                configs,
                meta,
                factory,
                hooks,
                utils,
                plugins = [],
            } = createOptions;
            try {
                this.config(configs);
                const params: AppParams = {
                    configure: this._configure,
                    utiler: this._utiler,
                };
                if (utils && utils.length > 0) this.utiler.add(...utils);
                if (hooks?.inited) await hooks.inited(params);
                const pluginsLoaded = loadPlugins(plugins, params, hooks);
                const BootModule = createBootModule(
                    params,
                    meta,
                    pluginsLoaded,
                );
                this.current = await factory({
                    configure: this._configure,
                    BootModule,
                });
                const appParams = {
                    ...params,
                    current: this.current,
                };
                this.current.enableShutdownHooks();
                await this.current.init();
                useContainer(this.current.select(BootModule), {
                    fallbackOnErrors: true,
                });
                created(appParams, hooks);
                this._commands = getCommands(appParams, hooks);
            } catch (error) {
                throw new Error(error);
            }
            return this;
        };
    }
}

/**
 * 构造App并创建命令
 *
 * @export
 * @param {Creator} creator
 */
export async function run(creator: Creator) {
    const app = await creator();
    buildCommands(app);
}
