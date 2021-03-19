import yargs from 'yargs';
import { CommandItem } from '../../../common/types';
import { MigrationRevertHandler } from '../handlers';
import { MigrationRunArguments } from '../types';
/**
 * 回滚迁移
 */
export const MRTCommand: CommandItem<any, MigrationRunArguments> = () => ({
    command: ['db:migration:resvert', 'dbmt'],
    describe: 'Reverts last executed migration',
    builder: {
        connection: {
            type: 'string',
            alias: 'c',
            describe: 'Name of the connection on which run a query.',
        },
        transaction: {
            type: 'string',
            alias: 't',
            describe:
                ' Indicates if transaction should be used or not formigration revert. Enabled by default.',
            default: 'default',
        },
    } as const,

    handler: async (args: yargs.Arguments<MigrationRunArguments>) =>
        MigrationRevertHandler(args),
});
