import {MigrationInterface, QueryRunner} from "typeorm";

export class AutoTables1616236505360 implements MigrationInterface {
    name = 'AutoTables1616236505360'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `user_refresh_tokens` (`id` varchar(36) NOT NULL, `value` varchar(500) NOT NULL, `expired_at` datetime NOT NULL COMMENT '令牌过期时间', `createdAt` datetime(6) NOT NULL COMMENT '令牌创建时间' DEFAULT CURRENT_TIMESTAMP(6), `accessTokenId` varchar(36) NULL, UNIQUE INDEX `REL_1dfd080c2abf42198691b60ae3` (`accessTokenId`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `users` (`id` varchar(36) NOT NULL, `nickname` varchar(255) NULL COMMENT '姓名', `username` varchar(255) NOT NULL COMMENT '用户名', `password` varchar(500) NOT NULL COMMENT '密码', `phone` varchar(255) NULL COMMENT '手机号', `email` varchar(255) NULL COMMENT '邮箱', `actived` tinyint NOT NULL COMMENT '用户状态,是否激活' DEFAULT 1, `createdAt` datetime(6) NOT NULL COMMENT '用户创建时间' DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX `IDX_fe0bb3f6520ee0469504521e71` (`username`), UNIQUE INDEX `IDX_a000cca60bcf04454e72769949` (`phone`), UNIQUE INDEX `IDX_97672ac88f789774dd47f7c8be` (`email`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `user_access_tokens` (`id` varchar(36) NOT NULL, `value` varchar(500) NOT NULL, `expired_at` datetime NOT NULL COMMENT '令牌过期时间', `createdAt` datetime(6) NOT NULL COMMENT '令牌创建时间' DEFAULT CURRENT_TIMESTAMP(6), `userId` varchar(36) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `user_captchas` (`id` varchar(36) NOT NULL, `code` varchar(255) NOT NULL COMMENT '验证码', `action` enum ('login', 'register', 'retrieve-password', 'reset-password', 'account-bound') NOT NULL COMMENT '验证操作类型', `type` enum ('sms', 'email') NOT NULL COMMENT '验证码类型', `value` varchar(255) NOT NULL COMMENT '手机号/邮箱地址', `created_at` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `content_comments` (`id` varchar(36) NOT NULL, `body` longtext NOT NULL COMMENT '评论内容', `createdAt` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6), `nsleft` int NOT NULL DEFAULT '1', `nsright` int NOT NULL DEFAULT '2', `postId` varchar(36) NOT NULL, `parentId` varchar(36) NULL, `creatorId` varchar(36) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `content_posts` (`id` varchar(36) NOT NULL, `title` varchar(255) NOT NULL COMMENT '文章标题', `body` longtext NOT NULL COMMENT '文章内容', `summary` varchar(255) NULL COMMENT '文章描述', `keywords` text NULL COMMENT '关键字', `isPublished` tinyint NOT NULL COMMENT '是否发布' DEFAULT 0, `publishedAt` varchar(255) NULL COMMENT '发布时间', `createdAt` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` datetime(6) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `deletedAt` datetime(6) NULL COMMENT '软删除', `type` enum ('html', 'markdown') NOT NULL DEFAULT 'markdown', `authorId` varchar(36) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `content_categories` (`id` varchar(36) NOT NULL, `name` varchar(255) NOT NULL COMMENT '分类名称', `order` int NOT NULL COMMENT '分类排序' DEFAULT '0', `nsleft` int NOT NULL DEFAULT '1', `nsright` int NOT NULL DEFAULT '2', `parentId` varchar(36) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `content_posts_categories_content_categories` (`contentPostsId` varchar(36) NOT NULL, `contentCategoriesId` varchar(36) NOT NULL, INDEX `IDX_9172320639056856745c6bc21a` (`contentPostsId`), INDEX `IDX_82926fe45def38f6a53838347a` (`contentCategoriesId`), PRIMARY KEY (`contentPostsId`, `contentCategoriesId`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `user_refresh_tokens` ADD CONSTRAINT `FK_1dfd080c2abf42198691b60ae39` FOREIGN KEY (`accessTokenId`) REFERENCES `user_access_tokens`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `user_access_tokens` ADD CONSTRAINT `FK_71a030e491d5c8547fc1e38ef82` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `content_comments` ADD CONSTRAINT `FK_5e1c3747a0031f305e94493361f` FOREIGN KEY (`postId`) REFERENCES `content_posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE");
        await queryRunner.query("ALTER TABLE `content_comments` ADD CONSTRAINT `FK_982a849f676860e5d6beb607f20` FOREIGN KEY (`parentId`) REFERENCES `content_comments`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `content_comments` ADD CONSTRAINT `FK_e1cb3604325ff0507c05e6dd8db` FOREIGN KEY (`creatorId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE");
        await queryRunner.query("ALTER TABLE `content_posts` ADD CONSTRAINT `FK_8fcc2d81ced7b8ade2bbd151b1a` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE");
        await queryRunner.query("ALTER TABLE `content_categories` ADD CONSTRAINT `FK_a03aea27707893300382b6f18ae` FOREIGN KEY (`parentId`) REFERENCES `content_categories`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `content_posts_categories_content_categories` ADD CONSTRAINT `FK_9172320639056856745c6bc21aa` FOREIGN KEY (`contentPostsId`) REFERENCES `content_posts`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `content_posts_categories_content_categories` ADD CONSTRAINT `FK_82926fe45def38f6a53838347a2` FOREIGN KEY (`contentCategoriesId`) REFERENCES `content_categories`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `content_posts_categories_content_categories` DROP FOREIGN KEY `FK_82926fe45def38f6a53838347a2`");
        await queryRunner.query("ALTER TABLE `content_posts_categories_content_categories` DROP FOREIGN KEY `FK_9172320639056856745c6bc21aa`");
        await queryRunner.query("ALTER TABLE `content_categories` DROP FOREIGN KEY `FK_a03aea27707893300382b6f18ae`");
        await queryRunner.query("ALTER TABLE `content_posts` DROP FOREIGN KEY `FK_8fcc2d81ced7b8ade2bbd151b1a`");
        await queryRunner.query("ALTER TABLE `content_comments` DROP FOREIGN KEY `FK_e1cb3604325ff0507c05e6dd8db`");
        await queryRunner.query("ALTER TABLE `content_comments` DROP FOREIGN KEY `FK_982a849f676860e5d6beb607f20`");
        await queryRunner.query("ALTER TABLE `content_comments` DROP FOREIGN KEY `FK_5e1c3747a0031f305e94493361f`");
        await queryRunner.query("ALTER TABLE `user_access_tokens` DROP FOREIGN KEY `FK_71a030e491d5c8547fc1e38ef82`");
        await queryRunner.query("ALTER TABLE `user_refresh_tokens` DROP FOREIGN KEY `FK_1dfd080c2abf42198691b60ae39`");
        await queryRunner.query("DROP INDEX `IDX_82926fe45def38f6a53838347a` ON `content_posts_categories_content_categories`");
        await queryRunner.query("DROP INDEX `IDX_9172320639056856745c6bc21a` ON `content_posts_categories_content_categories`");
        await queryRunner.query("DROP TABLE `content_posts_categories_content_categories`");
        await queryRunner.query("DROP TABLE `content_categories`");
        await queryRunner.query("DROP TABLE `content_posts`");
        await queryRunner.query("DROP TABLE `content_comments`");
        await queryRunner.query("DROP TABLE `user_captchas`");
        await queryRunner.query("DROP TABLE `user_access_tokens`");
        await queryRunner.query("DROP INDEX `IDX_97672ac88f789774dd47f7c8be` ON `users`");
        await queryRunner.query("DROP INDEX `IDX_a000cca60bcf04454e72769949` ON `users`");
        await queryRunner.query("DROP INDEX `IDX_fe0bb3f6520ee0469504521e71` ON `users`");
        await queryRunner.query("DROP TABLE `users`");
        await queryRunner.query("DROP INDEX `REL_1dfd080c2abf42198691b60ae3` ON `user_refresh_tokens`");
        await queryRunner.query("DROP TABLE `user_refresh_tokens`");
    }

}
