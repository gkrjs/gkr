import bcrypt from 'bcrypt';
import { BaseUtil, UtilConfigMaps } from '../../common';

/**
 * Bcrypt密码设置
 *
 * @export
 * @class HashUtil
 */
export class HashUtil extends BaseUtil<number> {
    protected configMaps: UtilConfigMaps = {
        maps: 'user.hash',
    };

    create(config?: number) {
        this.config = config ?? 10;
    }

    /**
     * 加密明文密码
     *
     * @param {string} password
     * @returns
     * @memberof HashUtil
     */
    encry(password: string) {
        return bcrypt.hashSync(password, this.config);
    }

    /**
     * 验证密码
     *
     * @param {string} password
     * @param {string} hashed
     * @returns
     * @memberof HashUtil
     */
    check(password: string, hashed: string) {
        return bcrypt.compareSync(password, hashed);
    }
}
