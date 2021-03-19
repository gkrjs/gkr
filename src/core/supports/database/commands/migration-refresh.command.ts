import yargs from 'yargs';
import { CommandItem } from '../../../common/types';
import { MigrationRefreshHandler } from '../handlers';
import { MigrationRefreshArguments } from '../types';
/**
 * 刷新迁移
 */
export const MRFCommand: CommandItem<any, MigrationRefreshArguments> = ({
    configure,
}) => ({
    command: ['db:migration:refresh', 'dbmf'],
    describe: 'Refresh migrations',
    builder: {
        connection: {
            type: 'string',
            alias: 'c',
            describe: 'Name of the connection on which run a query.',
        },
        onlydrop: {
            type: 'boolean',
            alias: 'p',
            describe: 'only drop database',
            default: false,
        },
        transaction: {
            type: 'string',
            alias: 't',
            describe:
                ' Indicates if transaction should be used or not for migration refresh. Enabled by default.',
            default: 'default',
        },
        generate: {
            type: 'boolean',
            alias: 'g',
            describe: 'generate migration before refresh',
            default: true,
        },
        seed: {
            type: 'boolean',
            alias: 's',
            describe: 'Seed data after refresh',
            default: false,
        },
    } as const,

    handler: async (args: yargs.Arguments<MigrationRefreshArguments>) =>
        MigrationRefreshHandler(configure, args),
});
