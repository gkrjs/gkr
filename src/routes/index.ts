import { ApiConfig, ConfigRegister, env } from '@/core';
import { v1 } from './v1';

export const api: ConfigRegister<ApiConfig> = () => ({
    title: env('API_TITLE', '极客编码'),
    description: env('API_DESCRIPTION', '极客编码全栈开发教程'),
    auth: true,
    prefix: {
        route: 'api',
        doc: 'api-docs',
    },
    default: env('API_DEFAULT_VERSION', 'v1'),
    enabled: [],
    versions: { v1 },
});
