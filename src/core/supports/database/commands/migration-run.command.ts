import yargs from 'yargs';
import { CommandItem } from '../../../common/types';
import { MigrationRunHandler } from '../handlers';
import { MigrationRunArguments } from '../types';
/**
 * 运行迁移
 */
export const MRNCommand: CommandItem<any, MigrationRunArguments> = ({
    configure,
}) => ({
    command: ['db:migration:run', 'dbmr'],
    describe: 'Runs all pending migrations.',
    builder: {
        connection: {
            type: 'string',
            alias: 'c',
            describe: 'Connection name of typeorm to connect database.',
        },
        transaction: {
            type: 'string',
            alias: 't',
            describe:
                ' Indicates if transaction should be used or not for migration run. Enabled by default.',
            default: 'default',
        },
        generate: {
            type: 'boolean',
            alias: 'g',
            describe: 'generate migration before run',
            default: true,
        },
        seed: {
            type: 'boolean',
            alias: 's',
            describe: 'Seed data after runned',
            default: false,
        },
    } as const,

    handler: async (args: yargs.Arguments<MigrationRunArguments>) =>
        MigrationRunHandler(configure, args),
});
