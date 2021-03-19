import merge from 'deepmerge';
import ora from 'ora';
import {
    Connection,
    ConnectionOptions,
    getConnection,
    getConnectionManager,
} from 'typeorm';
import { App } from '../../../common/app';
import { panic } from '../../../common/helpers';
import { DbOption, Seeder, SeederArguments, SeederConstructor } from '../types';
import { DbUtil } from '../utils';
import { factoryBuilder, resetForeignKey } from './base';

export const db = () => App.utiler.get(DbUtil);

/** ****************************************** Config && Option **************************************** */
/**
 * 通过名称获取一个数据库的连接配置
 *
 * @export
 * @template T
 * @param {string} [name]
 * @returns {T}
 */
export function dbOption<T extends DbOption = DbOption>(name?: string): T {
    return db().getOption(name) as T;
}

/**
 * 获取默认数据库连接名
 *
 * @export
 * @returns {string}
 */
export function defaultDbName(): string {
    return db().default;
}

/** ****************************************** Connection **************************************** */
/**
 * 创建一个临时连接
 * 主要用于CLI操作
 *
 * @export
 * @param {string} [name]
 * @param {Omit<DbOption, 'name'>} [options]
 * @return {*}  {Promise<Connection>}
 */
export async function makeConnection(
    name?: string,
    options?: Omit<DbOption, 'name'>,
): Promise<Connection> {
    const option = options
        ? merge(db().getOption(name) as Record<string, any>, options, {
              arrayMerge: (_d, s, _o) => s,
          })
        : db().getOption(name);
    try {
        if (getConnection(option.name).isConnected) {
            await getConnection(option.name).close();
        }
        // eslint-disable-next-line no-empty
    } catch (err) {}
    return getConnectionManager()
        .create(option as ConnectionOptions)
        .connect();
}

/**
 * 为CLI连接显示进度
 *
 * @export
 * @param {string} [name]
 * @return {*}
 */
export async function makeCliConnection(name?: string) {
    const spinner = ora('Start connect to database').start();
    let connection: Connection | undefined;
    try {
        connection = await makeConnection(name);
        spinner.succeed();
    } catch (error) {
        panic({
            spinner,
            message: `Connection to database named ${name} failed!`,
            error,
        });
    }
    return connection!;
}

/** ****************************************** Seeder **************************************** */

/**
 * 运行SeedRunner
 *
 * @export
 * @param {SeederConstructor} Clazz
 * @param {SeederArguments} args
 * @param {ora.Ora} spinner
 * @return {*}  {Promise<Connection>}
 */
export async function runSeeder(
    Clazz: SeederConstructor,
    args: SeederArguments,
    spinner: ora.Ora,
): Promise<Connection> {
    const seeder: Seeder = new Clazz(spinner, args);
    const connection = await makeCliConnection(args.connection);
    await resetForeignKey(connection);
    let em = connection.createEntityManager();
    if (typeof args.transaction === 'boolean' && !args.transaction) {
        await seeder.load({
            factorier: factoryBuilder(em, db().factories),
            factories: db().factories,
            em,
        });
        await resetForeignKey(connection, false);
        return connection;
    }
    // 在事务中运行
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    em = queryRunner.manager;
    await queryRunner.startTransaction();
    try {
        await seeder.load({
            factorier: factoryBuilder(em, db().factories),
            factories: db().factories,
            em,
        });
        // 提交事务
        await queryRunner.commitTransaction();
    } catch (err) {
        console.log(err);
        // 遇到错误则回滚
        await queryRunner.rollbackTransaction();
    } finally {
        // 执行事务
        await queryRunner.release();
        await resetForeignKey(connection, false);
    }
    return connection;
}
