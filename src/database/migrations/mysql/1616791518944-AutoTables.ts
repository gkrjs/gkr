import {MigrationInterface, QueryRunner} from "typeorm";

export class AutoTables1616791518944 implements MigrationInterface {
    name = 'AutoTables1616791518944'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user_messages` DROP FOREIGN KEY `FK_853e28ad8c195d597fd8a8d4b3b`");
        await queryRunner.query("ALTER TABLE `user_messages` DROP COLUMN `senderId`");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user_messages` ADD `senderId` varchar(36) NULL");
        await queryRunner.query("ALTER TABLE `user_messages` ADD CONSTRAINT `FK_853e28ad8c195d597fd8a8d4b3b` FOREIGN KEY (`senderId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
    }

}
