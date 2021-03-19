import yargs from 'yargs';
import { CommandItem } from '../../../common/types';
import { MigrationGenerateHandler } from '../handlers';
import { MigrationGenerateArguments } from '../types';
/**
 * 生成迁移
 * @param param0
 */
export const MGCommand: CommandItem<any, MigrationGenerateArguments> = ({
    configure,
}) => ({
    source: true,
    command: ['db:migration:generate', 'dbmg'],
    describe:
        'Generates a new migration file with sql needs to be executed to update schema.',
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
        dir: {
            type: 'string',
            alias: 'd',
            describe: 'Which directory where migration should be generated.',
        },
        pretty: {
            type: 'boolean',
            alias: 'p',
            describe: 'Pretty-print generated SQL',
            default: false,
        },
        outputJs: {
            alias: 'o',
            type: 'boolean',
            default: false,
            describe:
                'Generate a migration file on Javascript instead of Typescript',
        },
        dryrun: {
            alias: 'dr',
            type: 'boolean',
            default: false,
            describe:
                'Prints out the contents of the migration instead of writing it to a file',
        },
        check: {
            alias: 'check',
            type: 'boolean',
            default: false,
            describe:
                'Verifies that the current database is up to date and that no migrations are needed. Otherwise exits with code 1.',
        },
    } as const,

    handler: async (args: yargs.Arguments<MigrationGenerateArguments>) =>
        MigrationGenerateHandler(configure, args),
});
