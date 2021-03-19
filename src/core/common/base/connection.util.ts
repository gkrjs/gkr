import { Injectable } from '@nestjs/common';
import { CUtilConfigType, CUtilOptionType, UtilConfigMaps } from '../types';
import { BaseUtil } from './base.util';

/**
 * 短信发送扩展
 *
 * @export
 * @class SmsUtil
 * @extends {BaseUtil<SmsConfig>}
 */
@Injectable()
export abstract class ConnectionUtil<
    CT extends CUtilConfigType<OT, Record<string, any>>,
    OT extends CUtilOptionType<Record<string, any>>
> extends BaseUtil<CT> {
    protected abstract name: string;

    protected abstract configMaps: UtilConfigMaps;

    /**
     * 默认短信驱动
     *
     * @protected
     * @type {string}
     * @memberof SmsUtil
     */
    protected _default!: string;

    /**
     * 已启用的短信驱动类型
     *
     * @protected
     * @type {string[]}
     * @memberof SmsUtil
     */
    protected _enabled!: string[];

    /**
     * 已启用的短信驱动配置
     *
     * @protected
     * @type {SmsConnectionOption[]}
     * @memberof SmsUtil
     */
    protected _options!: OT[];

    get default() {
        return this._default;
    }

    get enabled() {
        return this._enabled;
    }

    get options() {
        return this.getOptions();
    }

    getOption(name?: string): OT {
        const findName: string | undefined = name ?? this._default;
        const option = this.options.find((item) => item.name === findName);
        if (!option) {
            throw new Error(`${name} option named ${findName} not exists!`);
        }
        return option as OT;
    }

    /**
     * 创建配置
     *
     * @param {SmsConfig} config
     * @memberof SmsUtil
     */
    create(config: CT) {
        this.config = config;
        this.setOptions();
    }

    protected getOptions(): OT[] {
        return this._options;
    }

    protected setOptions(): void {
        if (this.config.default) {
            this._default = this.config.default;
        } else {
            const error = `default ${this.name} connection or at least one enabled option should be configure`;
            if (this.config.enabled.length < 1) throw new Error(error);
            const [firstEnabled] = this.config.enabled;
            this._default = firstEnabled;
        }
        if (!this.config.enabled.includes(this._default)) {
            this.config.enabled.push(this._default);
        }
        for (const name of this.config.enabled) {
            const error = `${this.name} connection option named ${name} which enabled or default was not in config!`;
            const inOptions = this.config.connections
                .map((option) => option.name)
                .includes(name);

            if (!inOptions) throw new Error(error);
        }
        this._enabled = this.config.enabled;
        this._options = this.config.connections.filter((c) =>
            this._enabled.includes(c.name),
        );
    }
}
