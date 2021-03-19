import { BaseSeeder, DbFactory, isFile, panic } from '@/core';
import {
    CategoryEntity,
    CommentEntity,
    PostEntity,
} from '@/modules/content/entities';
import { CategoryRepository } from '@/modules/content/repositories';
import { UserRepository } from '@/modules/user';
import faker from 'faker';
import fs from 'fs';
import path from 'path';
import { EntityManager, In } from 'typeorm';
import { IPostFactoryOptions } from '../factories/content.factory';
import { categories, CategoryData, PostData, posts } from '../fixtures/content';

export default class ContentSeeder extends BaseSeeder {
    protected truncates = [PostEntity, CategoryEntity, CommentEntity];

    protected factorier!: DbFactory;

    public async run(_factorier: DbFactory, _em: EntityManager): Promise<any> {
        this.factorier = _factorier;
        await this.loadCategories(categories);
        await this.loadPosts(posts);
    }

    private async genRandomComments(
        post: PostEntity,
        count: number,
        parent?: CommentEntity,
    ) {
        const comments: CommentEntity[] = [];
        for (let i = 0; i < count; i++) {
            const comment = new CommentEntity();
            comment.body = faker.lorem.paragraph(
                Math.floor(Math.random() * 18) + 1,
            );
            comment.post = post;
            if (parent) {
                comment.parent = parent;
            }
            comments.push(await this.em.save(comment));
            if (Math.random() >= 0.8) {
                comment.children = await this.genRandomComments(
                    post,
                    Math.floor(Math.random() * 2),
                    comment,
                );
                await this.em.save(comment);
            }
        }
        return comments;
    }

    private async loadCategories(
        data: CategoryData[],
        parent?: CategoryEntity,
    ): Promise<void> {
        let order = 0;
        for (const item of data) {
            const category = new CategoryEntity();
            category.name = item.name;
            category.order = order;
            if (parent) category.parent = parent;
            await this.em.save(category);
            order++;
            if (item.children) {
                await this.loadCategories(item.children, category);
            }
        }
    }

    private async loadPosts(data: PostData[]) {
        const allCates = await this.em.find(CategoryEntity);
        const userRepo = this.em.getCustomRepository(UserRepository);
        const firstUser = await userRepo.findOneOrFail();
        for (const item of data) {
            const author = await userRepo.findOneOrFail({
                username: item.author,
            });
            const filePath = path.join(
                __dirname,
                '../files/posts',
                item.contentFile,
            );
            if (!isFile(filePath)) {
                panic({
                    spinner: this.spinner,
                    message: `post content file ${filePath} not exits!`,
                });
            }
            const options: IPostFactoryOptions = {
                title: item.title,
                body: fs.readFileSync(filePath, 'utf8'),
                isPublished: true,
                author,
            };
            if (item.summary) {
                options.summary = item.summary;
            }
            if (item.categories) {
                options.categories = await this.em
                    .getCustomRepository(CategoryRepository)
                    .find({ where: { name: In(item.categories) } });
            }
            const post = await this.factorier(PostEntity)(options).create();
            await this.genRandomComments(post, Math.floor(Math.random() * 5));
        }
        const redoms = await this.factorier(PostEntity)<IPostFactoryOptions>({
            categories: this.randListData(allCates),
            author: firstUser,
        }).createMany(100);
        for (const redom of redoms) {
            await this.genRandomComments(redom, Math.floor(Math.random() * 2));
        }
    }
}
