import {MigrationInterface, QueryRunner} from "typeorm";

export class AutoTables1616792795272 implements MigrationInterface {
    name = 'AutoTables1616792795272'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user_messages` CHANGE `type` `type` varchar(255) NULL COMMENT '消息类型(用于前台根据类型显示图标,点开链接地址等)'");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user_messages` CHANGE `type` `type` varchar(255) NOT NULL COMMENT '消息类型(用于前台根据类型显示图标,点开链接地址等)'");
    }

}
