import { AppParams } from '@/core/common';
import { RouterModule } from 'nest-router';
import { echoApi } from '../echo';
import { ApiConfig } from '../types';
import { DocUtil } from './doc.util';

/**
 * Restful API工具
 *
 * @export
 * @class ApiUtil
 * @extends {DocUtil}
 */
export class ApiUtil extends DocUtil {
    create(config: ApiConfig) {
        this.createConfig(config);
        this.createRoutes();
        this.createDocs();
    }

    /**
     * 把自动生成的路由模块加入CommonModule
     *
     * @return {*}
     * @memberof ApiUtil
     */
    globalMeta() {
        return {
            imports: [
                ...Object.values(this.modules),
                RouterModule.forRoutes(this._routes),
            ],
        };
    }

    listend(params: Required<AppParams>) {
        echoApi(params, this);
        return true;
    }
}
