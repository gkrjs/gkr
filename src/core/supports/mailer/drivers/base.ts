import merge from 'deepmerge';
import { MailSendParams } from '../types';

/**
 * 基础邮件驱动
 *
 * @export
 * @abstract
 * @class BaseMailer
 * @template C
 * @template T
 * @template O
 */
export abstract class BaseMailer<C, T, O extends MailSendParams> {
    /**
     * 初始化驱动配置
     *
     * @param {C} config
     * @memberof BaseMailer
     */
    constructor(protected readonly config: C) {}

    /**
     * 合并配置
     *
     * @protected
     * @param {C} [config]
     * @return {*}
     * @memberof BaseMailer
     */
    protected mergeConfig(config?: C) {
        return merge(this.config, config ?? {}, {
            arrayMerge: (_d, s, _o) => s,
        }) as C;
    }

    /**
     * 发送邮件
     *
     * @param {O} options
     * @param {C} [config]
     * @return {*}  {Promise<any>}
     * @memberof BaseMailer
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
     * @memberof BaseMailer
     */
    protected abstract makeClient(config: C): T;

    /**
     * 邮件发送器
     *
     * @protected
     * @abstract
     * @param {T} client
     * @param {O} options
     * @param {C} config
     * @return {*}  {Promise<any>}
     * @memberof BaseMailer
     */
    protected abstract makeSend(client: T, options: O, config: C): Promise<any>;
}
