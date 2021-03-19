import sanitizeHtml from 'sanitize-html';
import { App } from '../../common';
import { HtmlUtil } from './html.util';

const html = () => App.utiler.get(HtmlUtil);

/**
 * 清洁HTML
 *
 * @export
 * @param {string} body
 * @param {sanitizeHtml.IOptions} [options]
 * @return {*}
 */
export function cleanhtml(body: string, options?: sanitizeHtml.IOptions) {
    return html().sanitize(body, options);
}
