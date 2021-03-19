import chalk from 'chalk';
import ora from 'ora';
import { isInSource, panic } from '../../../common/helpers';
import { Configure } from '../../../configure';
import { makeCliConnection } from '../helpers/util';
import { MigrationRefreshArguments } from '../types';
import { autoGenerate } from './auto-generate';
import { MigrationRunHandler } from './migration-run.handler';
/**
 * 刷新迁移处理器
 * @param args
 */
export const MigrationRefreshHandler = async (
    configure: Configure,
    args: MigrationRefreshArguments,
) => {
    if (args.generate && isInSource()) await autoGenerate(configure, args);
    const connection = await makeCliConnection(args.connection);
    const spinner = ora('Start to drop database');
    try {
        spinner.start();
        await connection.dropDatabase();
        spinner.succeed(
            chalk.greenBright.underline('\n 👍 Finished drop database'),
        );
    } catch (error) {
        panic({ spinner, message: 'Database sync failed', error });
    }
    if (!args.onlydrop) {
        await MigrationRunHandler(configure, { ...args, generate: false });
    }
};
