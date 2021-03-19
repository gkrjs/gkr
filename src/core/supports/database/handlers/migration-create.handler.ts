import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import yargs from 'yargs';
import { panic } from '../../../common/helpers';
import { Configure } from '../../../configure/configure';
import { dbOption, defaultDbName } from '../helpers/util';
import { DbOption, MigrationCreateArguments } from '../types';
import { TypeormMigrationCreate } from './typeorm';
/**
 * 创建迁移处理器
 * @param configure
 * @param args
 */
export const MigrationCreateHandler = async (
    configure: Configure,
    args: yargs.Arguments<MigrationCreateArguments>,
) => {
    const spinner = ora('Start to create migration').start();
    const cname = args.connection ?? defaultDbName();
    let option: DbOption;
    try {
        option = dbOption(cname);
    } catch (error) {
        panic({ spinner, message: error.message });
    }
    try {
        const runner = new TypeormMigrationCreate();
        console.log();
        const migrationDir =
            configure.get('database.common.paths.migration') ??
            'src/database/migration';
        const dir = path.join(migrationDir, cname);
        runner.handler(
            {
                name: cname,
                dir,
                outputJs: args.outputJs,
            },
            option!,
        );
        spinner.succeed(
            chalk.greenBright.underline('\n 👍 Finished create migration'),
        );
    } catch (error) {
        panic({ spinner, message: 'Create migration failed!', error });
    }
};
