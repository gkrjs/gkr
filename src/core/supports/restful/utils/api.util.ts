import { RouterModule } from 'nest-router';
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
    getGlobalMeta() {
        return {
            imports: [
                ...Object.values(this.modules),
                RouterModule.forRoutes(this._routes),
            ],
        };
    }
}
