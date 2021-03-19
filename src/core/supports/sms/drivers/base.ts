import merge from 'deepmerge';
import { SmsSendParams } from '../types';

/**
 * 基础短信驱动
 *
 * @export
 * @abstract
 * @class BaseSms
 * @template C
 * @template T
 * @template O
 */
export abstract class BaseSms<C, T, O extends SmsSendParams> {
    /**
     * 初始化驱动配置
     *
     * @param {C} config
     * @memberof BaseSms
     */
    constructor(protected readonly config: C) {}

    /**
     * 合并配置
     *
     * @protected
     * @param {C} [config]
     * @return {*}
     * @memberof BaseSms
     */
    protected mergeConfig(config?: C) {
        return merge(this.config, config ?? {}, {
            arrayMerge: (_d, s, _o) => s,
        }) as C;
    }

    /**
     * 发送短信
     *
     * @param {O} options
     * @param {C} [config]
     * @return {*}  {Promise<any>}
     * @memberof BaseSms
     */
    async send(options: O, config?: C): Promise<any> {
        const configd = this.mergeConfig(config);
        return this.makeSend(this.makeClient(configd), options, configd);
    }

    /**
     * 创建客户端
     *
     * @protected
     * @abstract
     * @param {C} config
     * @return {*}  {T}
     * @memberof BaseSms
     */
    protected abstract makeClient(config: C): T;

    /**
     * 创建发送器
     *
     * @protected
     * @abstract
     * @param {T} client
     * @param {O} options
     * @param {C} config
     * @return {*}  {Promise<any>}
     * @memberof BaseSms
     */
    protected abstract makeSend(client: T, options: O, config: C): Promise<any>;
}
