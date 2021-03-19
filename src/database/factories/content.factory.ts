import { defineFactory, time } from '@/core';
import {
    CategoryEntity,
    CommentEntity,
    PostEntity,
} from '@/modules/content/entities';
import { UserEntity } from '@/modules/user/entities';
import Faker from 'faker';

export type IPostFactoryOptions = Partial<{
    title: string;
    summary: string;
    body: string;
    isPublished: boolean;
    categories: CategoryEntity[];
    comments: CommentEntity[];
}> & {
    author: UserEntity;
};
export const ContentFactory = defineFactory(
    PostEntity,
    async (faker: typeof Faker, options: IPostFactoryOptions) => {
        faker.setLocale('zh_CN');
        const post = new PostEntity();
        const {
            title,
            summary,
            body,
            isPublished,
            categories,
            author,
        } = options;
        post.title =
            title ?? faker.lorem.sentence(Math.floor(Math.random() * 10) + 6);
        if (summary) {
            post.summary = options.summary;
        }
        post.body =
            body ?? faker.lorem.paragraph(Math.floor(Math.random() * 500) + 1);
        post.isPublished = isPublished ?? Math.random() >= 0.5;
        // post.author = options?.author ?? ;
        if (Math.random() >= 0.5) {
            post.deletedAt = time().toDate();
        }
        if (categories) {
            post.categories = categories;
        }
        post.author = author;
        return post;
    },
);
