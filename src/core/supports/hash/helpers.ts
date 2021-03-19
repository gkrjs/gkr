import { App } from '../../common';
import { HashUtil } from './hash.util';

const hash = () => App.utiler.get(HashUtil);
/**
 * 加密明文密码
 *
 * @export
 * @param {string} password
 * @returns
 */
export function encrypt(password: string) {
    return hash().encry(password);
}

/**
 * 验证密码
 *
 * @export
 * @param {string} password
 * @param {string} hashed
 * @returns
 */
export function decrypt(password: string, hashed: string) {
    return hash().check(password, hashed);
}
