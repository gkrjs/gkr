import { Connection, ObjectType } from 'typeorm';
import { FactoryService } from '../services/factory.service';
import { DbFactoryBuilder, DefineFactory } from '../types';

/** ****************************************** Tools **************************************** */
/**
 * 获取Entity类名
 *
 * @export
 * @template T
 * @param {ObjectType<T>} entity
 * @returns {string}
 */
export function entityName<T>(entity: ObjectType<T>): string {
    if (entity instanceof Function) {
        return entity.name;
    }
    if (entity) {
        return new (entity as any)().constructor.name;
    }
    throw new Error('Enity is not defined');
}

/**
 * 关闭外键检测,防止数据注入出错
 *
 * @export
 * @param {Connection} connection
 * @param {boolean} [disabled=true]
 * @return {*}  {Promise<Connection>}
 */
export async function resetForeignKey(
    connection: Connection,
    disabled = true,
): Promise<Connection> {
    const { type } = connection.driver.options;
    let key: string;
    let query: string;
    if (type === 'sqlite') {
        key = disabled ? 'OFF' : 'ON';
        query = `PRAGMA foreign_keys = ${key};`;
    } else {
        key = disabled ? '0' : '1';
        query = `SET FOREIGN_KEY_CHECKS = ${key};`;
    }
    await connection.query(query);
    return connection;
}

/** ****************************************** Factory **************************************** */
/**
 * Factory定义器
 *
 * 定义factory,绑定Entiy类名
 * factoryFn自动注入faker.js对象
 *
 * @param entity
 * @param handler
 */
export const defineFactory: DefineFactory = (entity, handler) => () => ({
    entity,
    handler,
});

/**
 * Factory构造器,用于获取已经定义好的一个Entity的Factory解析器
 *
 * factory函数,使用高阶包装
 * ObjectType通过new (): T用于从类生成接口类型
 *
 * @param em
 */
export const factoryBuilder: DbFactoryBuilder = (em, factories) => (entity) => (
    settings,
) => {
    const name = entityName(entity);
    if (!factories[name]) {
        throw new Error(`has none factory for entity named ${name}`);
    }
    return new FactoryService(
        name,
        entity,
        em,
        factories[name].handler,
        settings,
    );
};
