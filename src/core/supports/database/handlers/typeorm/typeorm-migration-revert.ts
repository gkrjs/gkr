import { Connection } from 'typeorm';

/**
 * Reverts last migration command.
 */
export class TypeormMigrationRevert {
    async handler(args: { t: string }, connection: Connection) {
        const options = {
            transaction: 'all' as 'all' | 'none' | 'each',
        };

        switch (args.t) {
            case 'all':
                options.transaction = 'all';
                break;
            case 'none':
            case 'false':
                options.transaction = 'none';
                break;
            case 'each':
                options.transaction = 'each';
                break;
            default:
            // noop
        }

        await connection.undoLastMigration(options);
    }
}
