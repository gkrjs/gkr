import {MigrationInterface, QueryRunner} from "typeorm";

export class AutoTables1618311842887 implements MigrationInterface {
    name = 'AutoTables1618311842887'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user_messages` CHANGE `readed` `readed` tinyint NOT NULL COMMENT '是否已读' DEFAULT 0");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user_messages` CHANGE `readed` `readed` tinyint NOT NULL COMMENT '是否已读' DEFAULT '1'");
    }

}
