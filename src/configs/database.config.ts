import { ConfigRegister, DatabaseConfig, env } from '@/core';
import { ContentFactory } from '@/database/factories/content.factory';
import { UserFactory } from '@/database/factories/user.factory';
import ContentSeeder from '@/database/seeders/content.seeder';
import UserSeeder from '@/database/seeders/user.seeder';
import path from 'path';
/**
 * 数据库配置
 */
export const database: ConfigRegister<DatabaseConfig> = () => {
    return {
        default: env('DATABASE_DEFAULT', 'mysql'),
        enabled: [],
        connections: [
            {
                name: 'sqlite',
                type: 'sqlite',
                database: path.join(
                    process.cwd(),
                    env('DATABASE_PATH', 'database.sqlite'),
                ),
            },
            {
                name: 'mysql',
                type: 'mysql',
                host: env('DATABASE_HOST', '127.0.0.1'),
                port: env('DATABASE_PORT', (v) => Number(v), 3306),
                username: env('DATABASE_USERNAME', 'root'),
                password: env('DATABASE_PASSWORD', '123456'),
                database: env('DATABASE_NAME', 'first'),
                migrations: [
                    // FirstMigration1614556900305,
                    // AutoTables1614808047743,
                ],
                seeders: [UserSeeder, ContentSeeder],
                factories: [UserFactory, ContentFactory],
            },
            {
                name: 'mysql2',
                type: 'mysql',
                host: env('DATABASE_SECOND_HOST', '127.0.0.1'),
                port: env('DATABASE_SECOND_PORT', (v) => Number(v), 3306),
                username: env('DATABASE_SECOND_USERNAME', 'root'),
                password: env('DATABASE_SECOND_PASSWORD', '123456'),
                database: env('DATABASE_SECOND_NAME', 'second'),
            },
        ],
        common: {
            charset: 'utf8mb4',
            synchronize: false,
            logging: ['error'],
            paths: {
                migration: 'src/database/migrations',
            },
        },
    };
};
