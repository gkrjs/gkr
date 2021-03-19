import Faker from 'faker';
import { EntityManager, ObjectType } from 'typeorm';
import { isPromiseLike, panic } from '../../../common/helpers';
import { DbFactoryHandler, FactoryOverride } from '../types';

/**
 * 运行Factory
 *
 * @export
 * @class FactoryService
 * @template Entity
 * @template Settings
 */
export class FactoryService<Entity, Settings> {
    private mapFunction!: (entity: Entity) => Promise<Entity>;

    /**
     * 构造函数
     *
     * @param {string} name
     * @param {ObjectType<Entity>} entity
     * @param {EntityManager} em
     * @param {DbFactoryHandler<Entity, Settings>} factory
     * @param {Settings} settings
     * @memberof FactoryService
     */
    constructor(
        public name: string,
        public entity: ObjectType<Entity>,
        protected readonly em: EntityManager,
        private readonly factory: DbFactoryHandler<Entity, Settings>,
        private readonly settings: Settings,
    ) {}

    /**
     * Entity映射
     *
     * 用于一个Entity类绑定其它实现函数,此时Entity只作为一个键名
     *
     * @param {(entity: Entity) => Promise<Entity>} mapFunction
     * @return {*}  {FactoryService<Entity, Settings>}
     * @memberof FactoryService
     */
    map(
        mapFunction: (entity: Entity) => Promise<Entity>,
    ): FactoryService<Entity, Settings> {
        this.mapFunction = mapFunction;
        return this;
    }

    /**
     * 创建模拟数据,但不存储
     *
     * @param {FactoryOverride<Entity>} [overrideParams={}]
     * @return {*}  {Promise<Entity>}
     * @memberof FactoryService
     */
    async make(overrideParams: FactoryOverride<Entity> = {}): Promise<Entity> {
        if (this.factory) {
            let entity = await this.resolveEntity(
                await this.factory(Faker, this.settings),
            );
            if (this.mapFunction) {
                entity = await this.mapFunction(entity);
            }
            for (const key in overrideParams) {
                if (overrideParams[key]) {
                    entity[key] = overrideParams[key]!;
                }
            }

            return entity;
        }
        throw new Error('Could not found entity');
    }

    /**
     * 创建模拟数据并存储
     *
     * @param {FactoryOverride<Entity>} [overrideParams={}]
     * @return {*}  {Promise<Entity>}
     * @memberof FactoryService
     */
    async create(
        overrideParams: FactoryOverride<Entity> = {},
    ): Promise<Entity> {
        try {
            const entity = await this.make(overrideParams);
            return await this.em.save(entity);
        } catch (error) {
            const message = 'Could not save entity';
            panic({ message, error });
            throw new Error(message);
        }
    }

    /**
     * 创建多条模拟数据但不存储
     *
     * @param {number} amount
     * @param {FactoryOverride<Entity>} [overrideParams={}]
     * @return {*}  {Promise<Entity[]>}
     * @memberof FactoryService
     */
    async makeMany(
        amount: number,
        overrideParams: FactoryOverride<Entity> = {},
    ): Promise<Entity[]> {
        const list = [];
        for (let index = 0; index < amount; index += 1) {
            list[index] = await this.make(overrideParams);
        }
        return list;
    }

    /**
     * 创建多条模拟数据并存储
     *
     * @param {number} amount
     * @param {FactoryOverride<Entity>} [overrideParams={}]
     * @return {*}  {Promise<Entity[]>}
     * @memberof FactoryService
     */
    async createMany(
        amount: number,
        overrideParams: FactoryOverride<Entity> = {},
    ): Promise<Entity[]> {
        const list = [];
        for (let index = 0; index < amount; index += 1) {
            list[index] = await this.create(overrideParams);
        }
        return list;
    }

    /**
     * 根据Entity解析出其定义的处理器
     *
     * @private
     * @param {Entity} entity
     * @return {*}  {Promise<Entity>}
     * @memberof FactoryService
     */
    private async resolveEntity(entity: Entity): Promise<Entity> {
        for (const attribute in entity) {
            if (entity[attribute]) {
                if (isPromiseLike(entity[attribute])) {
                    entity[attribute] = await Promise.resolve(
                        entity[attribute],
                    );
                }

                if (
                    typeof entity[attribute] === 'object' &&
                    !(entity[attribute] instanceof Date)
                ) {
                    const subEntityFactory = entity[attribute];
                    try {
                        if (
                            typeof (subEntityFactory as any).make === 'function'
                        ) {
                            entity[
                                attribute
                            ] = await (subEntityFactory as any).make();
                        }
                    } catch (error) {
                        const message = `Could not make ${
                            (subEntityFactory as any).name
                        }`;
                        panic({ message, error });
                        throw new Error(message);
                    }
                }
            }
        }
        return entity;
    }
}
