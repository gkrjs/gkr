import chalk from 'chalk';
import ora from 'ora';
import { isInSource, panic } from '../../../common/helpers';
import { Configure } from '../../../configure';
import { makeCliConnection } from '../helpers/util';
import { MigrationRunArguments } from '../types';
import { autoGenerate } from './auto-generate';
import { SeedHandler } from './seed.handler';
import { TypeormMigrationRun } from './typeorm';
/**
 * 运行迁移处理器
 * @param args
 */
export const MigrationRunHandler = async (
    configure: Configure,
    args: MigrationRunArguments,
) => {
    if (args.generate && isInSource()) await autoGenerate(configure, args);
    const connection = await makeCliConnection(args.connection);
    const spinner = ora('Start to run migration');
    try {
        spinner.start();
        const runner = new TypeormMigrationRun();
        console.log();
        await runner.handler({ t: args.transaction || 'default' }, connection);
        await connection!.close();
        spinner.succeed(
            chalk.greenBright.underline('\n 👍 Run migration successed'),
        );
    } catch (error) {
        panic({ spinner, message: 'Run migration failed!', error });
    }
    if (args.seed) {
        console.log('\n');
        try {
            await SeedHandler({
                ...args,
                transaction: args.transaction !== undefined,
            });
        } catch (err) {
            process.exit(1);
        }
    }
};
