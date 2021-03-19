import chalk from 'chalk';
import { pick } from 'lodash';
import ora from 'ora';
import path from 'path';
import yargs from 'yargs';
import { panic } from '../../../common/helpers';
import { Configure } from '../../../configure/configure';
import { makeCliConnection } from '../helpers/util';
import { MigrationGenerateArguments } from '../types';
import { TypeormMigrationGenerate } from './typeorm';
/**
 * 生成迁移处理器
 * @param configure
 * @param args
 */
export const MigrationGenerateHandler = async (
    configure: Configure,
    args: yargs.Arguments<MigrationGenerateArguments>,
) => {
    const connection = await makeCliConnection(args.connection);
    const spinner = ora('Start to generate migration');
    try {
        spinner.start();
        const migrationDir =
            configure.get('database.common.paths.migration') ??
            'src/database/migration';
        const dir = path.join(migrationDir, connection.name);
        const runner = new TypeormMigrationGenerate();
        console.log();
        await runner.handler(
            {
                name: args.name,
                dir,
                ...pick(args, ['pretty', 'outputJs', 'dryrun', 'check']),
            },
            connection,
        );
        if (connection.isConnected) await connection.close();
        spinner.succeed(
            chalk.greenBright.underline('\n 👍 Finished generate migration'),
        );
    } catch (error) {
        panic({ spinner, message: 'Generate migration failed!', error });
    }
};
