import { Injectable } from '@nestjs/common';
import {
    ClassType,
    ConnectionUtil,
    NestedRecord,
    UtilConfigMaps,
    ValueOf,
} from '../../common';
import { BaseMailer } from './drivers/base';
import { QcloudMailer } from './drivers/qcloud';
import { SmtpMailer } from './drivers/smtp';
import {
    MailConfig,
    MailConnectionOption,
    MailerOptions,
    MailSendParams,
} from './types';

type DriverList = {
    [key: string]: ClassType<BaseMailer<any, any, any>>;
};

type ConnectionType = InstanceType<DriverList[keyof DriverList]>;

/**
 * 邮件推送扩展
 *
 * @export
 * @class MailerUtil
 * @extends {ConnectionUtil<MailConfig, MailConnectionOption, ConnectionType>}
 */
@Injectable()
export class MailerUtil extends ConnectionUtil<
    MailConfig,
    MailConnectionOption
> {
    /**
     * util名称
     *
     * @protected
     * @memberof MailerUtil
     */
    protected name = 'mailer';

    protected _connections: Record<string, ConnectionType> = {};

    /**
     * 驱动列表
     *
     * @protected
     * @static
     * @type {DriverList}
     * @memberof MailerUtil
     */
    protected static drivers: DriverList = {
        SMTP: SmtpMailer,
        QCLOUD: QcloudMailer,
    };

    /**
     * 配置映射
     *
     * @protected
     * @type {UtilConfigMaps}
     * @memberof MailerUtil
     */
    protected configMaps: UtilConfigMaps = {
        required: true,
        maps: 'mail',
    };

    /**
     * 发送邮件
     *
     * @template T
     * @param {T} options
     * @return {*}  {Promise<any>}
     * @memberof MailerUtil
     */
    async send<T extends MailSendParams>(options: T): Promise<any>;

    /**
     * 发送邮件
     *
     * @template T
     * @param {T} options
     * @param {string} [name]
     * @return {*}  {Promise<any>}
     * @memberof MailerUtil
     */
    async send<T extends MailSendParams>(
        options: T,
        name?: string,
    ): Promise<any>;

    /**
     * 发送邮件
     *
     * @template T
     * @template C
     * @param {T} options
     * @param {ValueOf<MailerOptions<C>>} config
     * @return {*}  {Promise<any>}
     * @memberof MailerUtil
     */
    async send<T extends MailSendParams, C extends NestedRecord = {}>(
        options: T,
        config: ValueOf<MailerOptions<C>>,
    ): Promise<any>;

    /**
     * 发送邮件
     *
     * @template T
     * @template C
     * @param {T} options
     * @param {string} name
     * @param {ValueOf<MailerOptions<C>>} config
     * @return {*}  {Promise<any>}
     * @memberof MailerUtil
     */
    async send<T extends MailSendParams, C extends NestedRecord = {}>(
        options: T,
        name: string,
        config: ValueOf<MailerOptions<C>>,
    ): Promise<any>;
    /**
     * 发送邮件
     *
     * @template T
     * @template C
     * @param {T} options
     * @param {(string | ValueOf<MailerOptions<C>>)} [name]
     * @param {ValueOf<MailerOptions<C>>} [config]
     * @return {*}
     * @memberof MailerUtil
     */
    async send<T extends MailSendParams, C extends NestedRecord = {}>(
        options: T,
        name?: string | ValueOf<MailerOptions<C>>,
        config?: ValueOf<MailerOptions<C>>,
    ) {
        let cname = this._default;
        if (name && typeof name === 'string') cname = name;
        const connection = this._connections[cname];
        if (!connection) {
            throw new Error(`Mail connection ${cname} not exists!`);
        }
        if (!name || typeof name === 'string') return connection.send(options);
        if (!config) return connection.send(options, name);
        return connection.send(options, config);
    }

    /**
     * 实例化邮件驱动
     *
     * @protected
     * @param {MailConnectionOption} { type, option }
     * @return {*}
     * @memberof MailerUtil
     */
    protected setConnection({ type, option }: MailConnectionOption) {
        return new MailerUtil.drivers[type]!(option);
    }

    protected setOptions() {
        super.setOptions();
        this._connections = Object.fromEntries(
            this._enabled.map((name) => {
                const option = this._options.find(
                    (item) => item.name === name,
                )!;
                return [name, this.setConnection(option)];
            }),
        );
    }
}
