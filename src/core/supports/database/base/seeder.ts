import { getRandomIndex } from '@/core/common';
import { Type } from '@nestjs/common';
import ora from 'ora';
import { EntityManager } from 'typeorm';
import { factoryBuilder } from '../helpers/base';
import {
    DbFactory,
    DbFactoryOption,
    Seeder,
    SeederArguments,
    SeederConstructor,
    SeederLoadParams,
} from '../types';

/**
 * 数据填充基类
 *
 * @export
 * @abstract
 * @class BaseSeeder
 * @implements {Seeder}
 */
export abstract class BaseSeeder implements Seeder {
    protected em!: EntityManager;

    protected factories!: {
        [entityName: string]: DbFactoryOption<any, any>;
    };

    protected truncates: Type<any>[] | Array<new (...args: any[]) => any> = [];

    constructor(
        protected readonly spinner: ora.Ora,
        protected readonly args: SeederArguments,
    ) {}

    /**
     * 清空原数据并重新加载数据
     *
     * @param {SeederLoadParams} { factory, factories, em }
     * @return {*}  {Promise<any>}
     * @memberof BaseSeeder
     */
    async load({ factorier, factories, em }: SeederLoadParams): Promise<any> {
        this.em = em;
        this.factories = factories;

        for (const truncate of this.truncates) {
            await this.em.clear(truncate);
        }
        const result = await this.run(factorier, this.em);
        return result;
    }

    /**
     * 运行seeder的关键方法
     *
     * @param factorier
     * @param connection
     */
    protected abstract run(
        factorier?: DbFactory,
        em?: EntityManager,
    ): Promise<any>;

    /**
     * 运行子seeder
     *
     * @param SubSeeder
     */
    protected async call(SubSeeder: SeederConstructor) {
        const subSeeder: Seeder = new SubSeeder(this.spinner, this.args);
        await subSeeder.load({
            factorier: factoryBuilder(this.em, this.factories),
            factories: this.factories,
            em: this.em,
        });
    }

    /**
     * 从列表中获取一个随机项
     *
     * @protected
     * @template T
     * @param {T[]} list
     * @return {*}
     * @memberof BaseSeeder
     */
    protected randItemData<
        T extends { id: string; [key: string]: any } = {
            id: string;
            [key: string]: any;
        }
    >(list: T[]) {
        return list[getRandomIndex(list.length)];
    }

    /**
     * 从列表中获取多个随机项组成一个新列表
     *
     * @protected
     * @template T
     * @param {T[]} list
     * @return {*}
     * @memberof BaseSeeder
     */
    protected randListData<
        T extends { id: string; [key: string]: any } = {
            id: string;
            [key: string]: any;
        }
    >(list: T[]) {
        const result: T[] = [];
        for (let i = 0; i < getRandomIndex(list.length); i++) {
            const random = this.randItemData<T>(list);
            if (!result.find((item) => item.id === random.id)) {
                result.push(random);
            }
        }
        return result;
    }
}
