import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import { panic } from '../../../common';
import { Configure } from '../../../configure';
import { makeCliConnection } from '../helpers/util';
import { TypeOrmArguments } from '../types';
import { TypeormMigrationGenerate } from './typeorm';

export async function autoGenerate(
    configure: Configure,
    args: TypeOrmArguments,
) {
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
                name: 'AutoTables',
                dir,
                pretty: false,
                outputJs: false,
                dryrun: false,
                check: false,
                auto: true,
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
}
