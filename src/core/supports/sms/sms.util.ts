import {
    ClassType,
    ConnectionUtil,
    NestedRecord,
    UtilConfigMaps,
    ValueOf,
} from '../../common';
import { AliyunSms, QcloudSms } from './drivers';
import { BaseSms } from './drivers/base';
import {
    SmsConfig,
    SmsConnectionOption,
    SmsDriverOptions,
    SmsSendParams,
} from './types';

type DriverList = {
    [key: string]: ClassType<BaseSms<any, any, any>>;
};
type ConnectionType = InstanceType<DriverList[keyof DriverList]>;

/**
 * 短信发送扩展
 *
 * @export
 * @class SmsUtil
 * @extends {ConnectionUtil<SmsConfig, SmsConnectionOption, ConnectionType>}
 */
export class SmsUtil extends ConnectionUtil<SmsConfig, SmsConnectionOption> {
    /**
     * util名称
     *
     * @protected
     * @memberof SmsUtil
     */
    protected name = 'sms';

    protected _connections: Record<string, ConnectionType> = {};

    /**
     * 驱动类列表
     *
     * @protected
     * @static
     * @type {DriverList}
     * @memberof SmsUtil
     */
    protected static drivers: DriverList = {
        ALIYUN: AliyunSms,
        QCLOUD: QcloudSms,
    };

    /**
     * 配置映射
     *
     * @protected
     * @type {UtilConfigMaps}
     * @memberof SmsUtil
     */
    protected configMaps: UtilConfigMaps = {
        required: true,
        maps: 'sms',
    };

    /**
     * 添加额外的驱动
     *
     * @static
     * @template T
     * @template TC
     * @template TT
     * @template TO
     * @param {string} name
     * @param {ClassType<T>} driver
     * @return {*}
     * @memberof SmsUtil
     */
    static addDriver<
        T extends BaseSms<TC, TT, TO>,
        TC,
        TT,
        TO extends SmsSendParams
    >(name: string, driver: ClassType<T>) {
        this.drivers[name] = driver;
        return this;
    }

    /**
     * 获取驱动
     *
     * @static
     * @return {*}
     * @memberof SmsUtil
     */
    static getDrivers() {
        return this.drivers;
    }

    get connections() {
        return this._connections;
    }

    /**
     * 发送短信
     *
     * @template T
     * @param {T} options
     * @return {*}  {Promise<any>}
     * @memberof SmsUtil
     */
    async send<T extends SmsSendParams>(options: T): Promise<any>;

    /**
     * 发送短信
     *
     * @template T
     * @param {T} options
     * @param {string} [name]
     * @return {*}  {Promise<any>}
     * @memberof SmsUtil
     */
    async send<T extends SmsSendParams>(
        options: T,
        name?: string,
    ): Promise<any>;

    /**
     * 发送短信
     *
     * @template T
     * @template C
     * @param {T} options
     * @param {ValueOf<SmsDriverOptions<C>>} config
     * @return {*}  {Promise<any>}
     * @memberof SmsUtil
     */
    async send<T extends SmsSendParams, C extends NestedRecord = {}>(
        options: T,
        config: ValueOf<SmsDriverOptions<C>>,
    ): Promise<any>;

    /**
     * 发送短信
     *
     * @template T
     * @template C
     * @param {T} options
     * @param {string} name
     * @param {ValueOf<SmsDriverOptions<C>>} config
     * @return {*}  {Promise<any>}
     * @memberof SmsUtil
     */
    async send<T extends SmsSendParams, C extends NestedRecord = {}>(
        options: T,
        name: string,
        config: ValueOf<SmsDriverOptions<C>>,
    ): Promise<any>;

    /**
     * 发送短信
     *
     * @template T
     * @template C
     * @param {T} options
     * @param {(string | ValueOf<SmsDriverOptions<C>>)} [name]
     * @param {ValueOf<SmsDriverOptions<C>>} [config]
     * @return {*}
     * @memberof SmsUtil
     */
    async send<T extends SmsSendParams, C extends NestedRecord = {}>(
        options: T,
        name?: string | ValueOf<SmsDriverOptions<C>>,
        config?: ValueOf<SmsDriverOptions<C>>,
    ) {
        let cname = this._default;
        if (name && typeof name === 'string') cname = name;
        const connection = this._connections[cname];
        if (!connection) {
            throw new Error(`Sms connection ${cname} not exists!`);
        }
        if (options.vars) {
            options.vars = Object.fromEntries(
                Object.entries(options.vars).map(([key, value]) => [
                    key,
                    value.toString(),
                ]),
            );
        }
        if (!name || typeof name === 'string') return connection.send(options);
        if (!config) return connection.send(options, name);
        return connection.send(options, config);
    }

    /**
     * 实例化短信驱动
     *
     * @protected
     * @param {SmsConnectionOption} { type, option }
     * @return {*}
     * @memberof SmsUtil
     */
    protected setConnection({ type, option }: SmsConnectionOption) {
        return new SmsUtil.drivers[type]!(option);
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
