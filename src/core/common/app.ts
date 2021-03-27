import { INestApplication } from '@nestjs/common';
import { FastifyAdapter } from '@nestjs/platform-fastify';
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
import {
    AppParams,
    CreateOptions,
    Creator,
    CreatorData,
    PluginModuleType,
} from './types';
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

    protected static _plugins: Array<PluginModuleType> = [];

    /**
     * 命令列表
     *
     * @protected
     * @static
     * @type {Array<CommandModule<any, any>>}
     * @memberof App
     */
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

    static get plugins() {
        return this._plugins;
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
    static async create(options: CreateOptions): Promise<CreatorData> {
        const { configs, meta, factory, hooks, utils, plugins = [] } = options;
        try {
            this.config(configs);
            if (utils && utils.length > 0) this.utiler.add(...utils);
            if (hooks?.inited) await hooks.inited(this.getParams());
            this._plugins = loadPlugins(plugins, this.getParams(), hooks);
            const BootModule = createBootModule(
                this.getParams(),
                meta,
                this._plugins,
            );
            this.current = await factory({
                configure: this._configure,
                BootModule,
            });
            this.current.enableShutdownHooks();
            useContainer(this.current.select(BootModule), {
                fallbackOnErrors: true,
            });
            created(this.getParams(), hooks);
            if (this.current.getHttpAdapter() instanceof FastifyAdapter) {
                await this.current.init();
            }

            this._commands = getCommands(this.getParams(), hooks, options.echo);
            return { commands: this._commands, hooks, ...this.getParams() };
        } catch (error) {
            throw new Error(error);
        }
    }

    protected static getParams(): AppParams {
        return {
            configure: this._configure,
            utiler: this._utiler,
            plugins: this._plugins,
            current: this.current ?? undefined,
        };
    }
}

export function createApp(options: CreateOptions): Creator {
    return () => App.create(options);
}

/**
 * 构造App并创建命令
 *
 * @export
 * @param {Creator} creator
 */
export async function run(creator: Creator) {
    const { commands } = await creator();
    buildCommands(commands);
}
