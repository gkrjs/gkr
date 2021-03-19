import yargs from 'yargs';
import { CommandItem } from '../../../common/types';
import { MigrationCreateHandler } from '../handlers';
import { MigrationCreateArguments } from '../types';
/**
 * 创建迁移
 * @param param0
 */
export const MCCommand: CommandItem<any, MigrationCreateArguments> = ({
    configure,
}) => ({
    source: true,
    command: ['db:migration:create', 'dbmc'],
    describe: 'Creates a new migration file',
    builder: {
        connection: {
            type: 'string',
            alias: 'c',
            describe: 'Connection name of typeorm to connect database.',
        },
        name: {
            type: 'string',
            alias: 'n',
            describe: 'Name of the migration class.',
            demandOption: true,
        },
        outputJs: {
            alias: 'o',
            type: 'boolean',
            default: false,
            describe:
                'Generate a migration file on Javascript instead of Typescript',
        },
    } as const,

    handler: async (args: yargs.Arguments<MigrationCreateArguments>) =>
        MigrationCreateHandler(configure, args),
});
