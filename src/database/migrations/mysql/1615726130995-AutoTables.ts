import {MigrationInterface, QueryRunner} from "typeorm";

export class AutoTables1615726130995 implements MigrationInterface {
    name = 'AutoTables1615726130995'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `content_posts` DROP FOREIGN KEY `FK_8fcc2d81ced7b8ade2bbd151b1a`");
        await queryRunner.query("ALTER TABLE `content_posts` CHANGE `authorId` `authorId` varchar(36) NOT NULL");
        await queryRunner.query("ALTER TABLE `content_posts` ADD CONSTRAINT `FK_8fcc2d81ced7b8ade2bbd151b1a` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `content_posts` DROP FOREIGN KEY `FK_8fcc2d81ced7b8ade2bbd151b1a`");
        await queryRunner.query("ALTER TABLE `content_posts` CHANGE `authorId` `authorId` varchar(36) NULL");
        await queryRunner.query("ALTER TABLE `content_posts` ADD CONSTRAINT `FK_8fcc2d81ced7b8ade2bbd151b1a` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE");
    }

}
