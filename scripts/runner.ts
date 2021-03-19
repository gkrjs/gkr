import chalk from 'chalk';
import yargs, { CommandModule } from 'yargs';
import * as commands from './commands';
import { excuteHandler } from './tools/console';

const { hideBin } = require('yargs/helpers');

const args = hideBin(process.argv) as string[];
// 如果是excute命令则执行App内部命令,否则执行导入的其它命令
if (args.length > 0 && (args[0] === 'excute' || args[0] === 'e')) {
    args.shift();
    excuteHandler({ cmd: args.join(' ') });
} else {
    yargs(args);
    const cmds = Object.values(commands) as Array<CommandModule<any, any>>;

    cmds.forEach((command) => yargs.command(command));
    yargs
        .usage('Usage: $0 <command> [options]')
        .demandCommand(1)
        .strict()
        .scriptName('cli')
        .fail((msg, err, y) => {
            if ((!msg && !err) || args.length === 0) {
                yargs.showHelp();
                process.exit();
            }
            if (msg) console.error(chalk.red(msg));
            if (err) console.error(chalk.red(err.message));
            process.exit();
        })
        .alias('v', 'version')
        .help('h')
        .alias('h', 'help').argv;
}
