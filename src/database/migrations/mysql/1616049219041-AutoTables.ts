import {MigrationInterface, QueryRunner} from "typeorm";

export class AutoTables1616049219041 implements MigrationInterface {
    name = 'AutoTables1616049219041'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user_captchas` CHANGE `action` `action` enum ('login', 'register', 'retrieve-password', 'reset-password', 'account-bound') NOT NULL COMMENT '验证操作类型'");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user_captchas` CHANGE `action` `action` enum ('registration', 'reset-password') NOT NULL COMMENT '验证操作类型'");
    }

}
