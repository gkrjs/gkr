import chalk from 'chalk';
import ora from 'ora';
import { panic } from '../../../common';
import { dbOption, runSeeder } from '../helpers/util';
import { SeederService } from '../services/seeder.service';
import { SeederArguments } from '../types';
/**
 * 数据填充命令处理器
 * @param args
 */
export const SeedHandler = async (args: SeederArguments) => {
    const runner = dbOption(args.connection).seedRunner ?? SeederService;
    const spinner = ora('Start run seeder');
    try {
        spinner.start();
        await runSeeder(runner, args, spinner);
        spinner.succeed(
            `\n 👍 ${chalk.greenBright.underline(`Finished Seeding`)}`,
        );
    } catch (error) {
        panic({ spinner, message: `Run seeder failed`, error });
    }
};
