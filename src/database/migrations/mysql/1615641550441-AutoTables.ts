import {MigrationInterface, QueryRunner} from "typeorm";

export class AutoTables1615641550441 implements MigrationInterface {
    name = 'AutoTables1615641550441'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `users` ADD `updated_at` datetime(6) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `users` DROP COLUMN `updated_at`");
    }

}
