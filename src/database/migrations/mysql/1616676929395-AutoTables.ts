import {MigrationInterface, QueryRunner} from "typeorm";

export class AutoTables1616676929395 implements MigrationInterface {
    name = 'AutoTables1616676929395'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `users` ADD `deletedAt` datetime(6) NULL COMMENT '软删除'");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `users` DROP COLUMN `deletedAt`");
    }

}
