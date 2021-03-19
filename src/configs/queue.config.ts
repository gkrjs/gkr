import { ConfigRegister, QueueConfig } from '@/core';

export const queue: ConfigRegister<QueueConfig> = () => ({
    default: 'main',
    enabled: [],
    connections: [
        {
            name: 'main',
            // redis: 'local'
        },
    ],
});
