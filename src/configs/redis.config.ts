import { ConfigRegister, env, RedisConfig } from '@/core';

export const redis: ConfigRegister<RedisConfig> = () => ({
    default: 'local',
    enabled: [],
    connections: [
        {
            name: 'local',
            host: env('REDIS_HOST', '127.0.0.1'),
            port: env<number>('REDIS_PORT', (v) => Number(v), 6379),
            password: env('REDIS_PASSWORD', undefined),
        },
    ],
});
