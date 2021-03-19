import { Provider, Type } from '@nestjs/common';
import { Configure } from '../configure/configure';
import { BaseUtil } from './base/base.util';
import { ClassType } from './types';

export type UtilItem<T extends BaseUtil<CT>, CT> = {
    use: ClassType<T>;
    value: T;
};

export type UtilCollection<CT extends any = any> = Array<
    UtilItem<BaseUtil<CT>, CT>
>;

/**
 * Util管理器
 *
 * @export
 * @class Utiler
 */
export class Utiler {
    /**
     * 已经实例化并初始化的Util
     *
     * @protected
     * @static
     * @type {UtilCollection}
     * @memberof App
     */
    protected _utils: UtilCollection = [];

    constructor(protected configure: Configure) {}

    /**
     * 获取所有Util
     *
     * @return {*}
     * @memberof Utiler
     */
    all() {
        return this._utils;
    }

    has<T extends BaseUtil<CT>, CT>(util: Type<T>): boolean {
        const item = this._utils.find((u) => u.use === util) as UtilItem<T, CT>;
        return !!item;
    }

    /**
     * 检测Util是否存在并被初始化
     * 返回UtilItem类型的值
     *
     * @template T
     * @template CT
     * @param {Type<T>} util
     * @return {*}
     * @memberof Utiler
     */
    item<T extends BaseUtil<CT>, CT>(util: Type<T>) {
        const item = this._utils.find((u) => u.use === util) as UtilItem<T, CT>;
        if (!item) {
            throw new Error(`${util.name} not exists!`);
        }
        if (!item.value.created) {
            throw new Error(`${util.name} not created by configure!`);
        }
        return item;
    }

    /**
     * 添加Util类
     *
     * @param {...Array<Type<BaseUtil<any>>>} utils
     * @memberof Utiler
     */
    add(...utils: Array<Type<BaseUtil<any>>>): void {
        utils.forEach((u) => {
            if (!this.has(u)) this.addItem(u);
        });
    }

    /**
     * 获取Util类初始化后的实例
     *
     * @template T
     * @template CT
     * @param {Type<T>} util
     * @return {*}  {T}
     * @memberof Utiler
     */
    get<T extends BaseUtil<CT>, CT>(util: Type<T>): T {
        const item = this.item(util);
        return item.value as T;
    }

    /**
     * 把Util转化为Nestjs提供者
     *
     * @template T
     * @template CT
     * @param {Type<T>} util
     * @return {*}  {Provider}
     * @memberof Utiler
     */
    provider<T extends BaseUtil<CT>, CT>(util: Type<T>): Provider {
        const item = this.item(util);
        return { provide: item.use, useValue: item.value };
    }

    /**
     * 添加单个Util类
     * 先实例化Util类
     * 然后使用configure对象对Util进行实例化并加入utils属性
     *
     * @protected
     * @param {Type<BaseUtil<any>>} Util
     * @return {*}  {boolean}
     * @memberof Utiler
     */
    protected addItem(Util: Type<BaseUtil<any>>): boolean {
        const exists = this._utils.find((u) => u.use === Util);
        if (exists) return false;
        const item = new Util();
        item.factory(this.configure);
        this._utils.push({ use: Util, value: item });
        return true;
    }
}
