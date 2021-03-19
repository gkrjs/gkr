import { NestFactory } from '@nestjs/core';
import {
    FastifyAdapter,
    NestFastifyApplication,
} from '@nestjs/platform-fastify';
import merge from 'deepmerge';
import * as configs from './configs';
import { ApiUtil, App, db, echoApi, queue, restful, run } from './core';
import { ContentModule } from './modules/content';
import { UserModule } from './modules/user';
import { api } from './routes';

const creator = App.create({
    configs: { ...configs, api },
    utils: [ApiUtil],
    plugins: [UserModule, ContentModule],
    factory: async ({ BootModule }) => {
        const instance = await NestFactory.create<NestFastifyApplication>(
            BootModule,
            new FastifyAdapter(),
            {
                cors: true,
                logger: ['error', 'warn'],
            },
        );
        return instance;
    },
    hooks: {
        listend: ({ configure, utiler }) => echoApi({ configure, utiler }),
        closed: async () => db().close(),
    },
    meta: {
        global: () =>
            merge(
                merge(db().getGlobalMeta(), restful().getGlobalMeta()),
                queue().getGlobalMeta(),
            ),
        plugin: ({ plugin }) =>
            merge(db().getPluginMeta(plugin), queue().getPluginMeta(plugin)),
    },
    commands: () => db().getCommands(),
});
run(creator);
