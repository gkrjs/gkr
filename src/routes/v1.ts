import { VersionOption } from '@/core';
import {
    CategoryController,
    CommentController,
    PostController,
} from '@/modules/content/controllers';
import { UserControllers } from '@/modules/user';

export const v1: VersionOption = {
    routes: [
        {
            name: 'app',
            path: '/',
            controllers: [],
            doc: {
                title: '应用接口',
                description: '前端APP应用接口',
            },
            children: [
                {
                    name: 'content',
                    path: '/content',
                    controllers: [
                        CategoryController,
                        PostController,
                        CommentController,
                    ],
                    doc: {
                        tags: ['内容'],
                    },
                },
                {
                    name: 'user',
                    path: '/user',
                    controllers: Object.values(UserControllers),
                    doc: {
                        tags: ['用户'],
                    },
                },
            ],
        },
    ],
};
