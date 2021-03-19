import yargs, { CommandModule } from 'yargs';
import { excuteHandler, ExcuteOptions } from '../tools/console';
/**
 * 执行App内部命令
 */
export const excute: CommandModule<any, ExcuteOptions> = {
    command: ['excute <cmd>', 'e'],
    describe: 'Excute app commands',
    handler: async (args: yargs.Arguments<ExcuteOptions>) =>
        excuteHandler(args),
};
