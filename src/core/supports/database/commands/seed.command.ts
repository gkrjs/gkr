import yargs from 'yargs';
import { CommandItem } from '../../../common/types';
import { SeedHandler } from '../handlers/seed.handler';
import { SeederArguments } from '../types';
/**
 * 数据填充
 */
export const SeedCommand: CommandItem<any, SeederArguments> = () => ({
    command: ['db:seed', 'dbs'],
    describe: 'Runs all pending migrations.',
    builder: {
        connection: {
            type: 'string',
            alias: 'c',
            describe: 'Connection name of typeorm to connect database.',
        },
        transaction: {
            type: 'boolean',
            alias: 't',
            describe: ' If is seed data in transaction,default is true',
            default: true,
        },
    } as const,

    handler: async (args: yargs.Arguments<SeederArguments>) =>
        SeedHandler(args),
});
