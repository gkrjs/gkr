import chalk from 'chalk';
import ora from 'ora';
import { panic } from '../../../common/helpers';
import { makeCliConnection } from '../helpers/util';
import { MigrationRevertArguments } from '../types';
import { TypeormMigrationRevert } from './typeorm';
/**
 * 回滚迁移处理器
 * @param args
 */
export const MigrationRevertHandler = async (
    args: MigrationRevertArguments,
) => {
    const connection = await makeCliConnection(args.connection);
    const spinner = ora('Start to revert migration');
    try {
        spinner.start();
        const runner = new TypeormMigrationRevert();
        console.log();
        await runner.handler({ t: args.transaction || 'default' }, connection);
        await connection!.close();
        spinner.succeed(
            chalk.greenBright.underline('\n 👍 Revert migration successed'),
        );
    } catch (error) {
        panic({ spinner, message: 'Revert migration failed!', error });
    }
};
