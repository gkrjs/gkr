import {MigrationInterface, QueryRunner} from "typeorm";

export class AutoTables1616791410548 implements MigrationInterface {
    name = 'AutoTables1616791410548'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `user_messages` (`id` varchar(36) NOT NULL, `title` varchar(255) NOT NULL COMMENT '文章标题', `body` longtext NOT NULL COMMENT '文章内容', `readed` tinyint NOT NULL COMMENT '是否已读' DEFAULT 1, `created_at` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `senderId` varchar(36) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `user_messages_receivers_users` (`userMessagesId` varchar(36) NOT NULL, `usersId` varchar(36) NOT NULL, INDEX `IDX_db63141edbe7c21c787df3b491` (`userMessagesId`), INDEX `IDX_9bfac9d0857c64f7e3586ac30c` (`usersId`), PRIMARY KEY (`userMessagesId`, `usersId`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `user_messages` ADD CONSTRAINT `FK_853e28ad8c195d597fd8a8d4b3b` FOREIGN KEY (`senderId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `user_messages_receivers_users` ADD CONSTRAINT `FK_db63141edbe7c21c787df3b491a` FOREIGN KEY (`userMessagesId`) REFERENCES `user_messages`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `user_messages_receivers_users` ADD CONSTRAINT `FK_9bfac9d0857c64f7e3586ac30c2` FOREIGN KEY (`usersId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user_messages_receivers_users` DROP FOREIGN KEY `FK_9bfac9d0857c64f7e3586ac30c2`");
        await queryRunner.query("ALTER TABLE `user_messages_receivers_users` DROP FOREIGN KEY `FK_db63141edbe7c21c787df3b491a`");
        await queryRunner.query("ALTER TABLE `user_messages` DROP FOREIGN KEY `FK_853e28ad8c195d597fd8a8d4b3b`");
        await queryRunner.query("DROP INDEX `IDX_9bfac9d0857c64f7e3586ac30c` ON `user_messages_receivers_users`");
        await queryRunner.query("DROP INDEX `IDX_db63141edbe7c21c787df3b491` ON `user_messages_receivers_users`");
        await queryRunner.query("DROP TABLE `user_messages_receivers_users`");
        await queryRunner.query("DROP TABLE `user_messages`");
    }

}
