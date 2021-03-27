import { NestFactory } from '@nestjs/core';
import {
    FastifyAdapter,
    NestFastifyApplication,
} from '@nestjs/platform-fastify';
import * as configs from './configs';
import { ApiUtil, createApp, run } from './core';
import { ContentModule } from './modules/content';
import { UserModule } from './modules/user';
import { api } from './routes';

const creator = createApp({
    configs: { ...configs, api },
    utils: [ApiUtil],
    plugins: [UserModule, ContentModule],
    echo: false,
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
});
run(creator);
