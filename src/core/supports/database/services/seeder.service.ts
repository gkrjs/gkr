import { EntityManager } from 'typeorm';
import { App } from '../../../common/app';
import { BaseSeeder } from '../base/seeder';
import { DbFactory } from '../types';
import { DbUtil } from '../utils';

/**
 * 默认的Seed Runner
 *
 * @export
 * @class SeederService
 * @extends {BaseSeeder}
 */
export class SeederService extends BaseSeeder {
    /**
     * 运行一个连接的填充类
     *
     * @param {DbFactory} _factory
     * @param {Connection} _connection
     * @return {*}  {Promise<any>}
     * @memberof SeederService
     */
    public async run(_factory: DbFactory, _em: EntityManager): Promise<any> {
        const db = () => App.utiler.get(DbUtil);
        const seeders = db().getOption(_em.connection.name).seeders ?? [];
        for (const seeder of seeders) {
            await this.call(seeder);
        }
    }
}
