import {MigrationInterface, QueryRunner} from "typeorm";

export class AutoTables1616792775861 implements MigrationInterface {
    name = 'AutoTables1616792775861'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user_messages` ADD `type` varchar(255) NOT NULL COMMENT '消息类型(用于前台根据类型显示图标,点开链接地址等)'");
        await queryRunner.query("ALTER TABLE `user_messages` CHANGE `title` `title` varchar(255) NULL COMMENT '消息标题(没有就是alert消息)'");
        await queryRunner.query("ALTER TABLE `user_messages` CHANGE `body` `body` longtext NOT NULL COMMENT '消息内容'");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user_messages` CHANGE `body` `body` longtext NOT NULL COMMENT '文章内容'");
        await queryRunner.query("ALTER TABLE `user_messages` CHANGE `title` `title` varchar(255) NOT NULL COMMENT '文章标题'");
        await queryRunner.query("ALTER TABLE `user_messages` DROP COLUMN `type`");
    }

}
