import merge from 'deepmerge';
import sanitizeHtml from 'sanitize-html';
import { BaseUtil, UtilConfigMaps } from '../../common';

/**
 * HTML标签清理,防XSS攻击
 *
 * @export
 * @class HtmlUtil
 * @extends {BaseUtil<sanitizeHtml.IOptions>}
 */
export class HtmlUtil extends BaseUtil<sanitizeHtml.IOptions> {
    protected configMaps: UtilConfigMaps = {
        maps: 'html',
    };

    create(_config?: sanitizeHtml.IOptions) {
        this.config = merge(
            {
                allowedTags: sanitizeHtml.defaults.allowedTags.concat([
                    'img',
                    'code',
                ]),
                allowedAttributes: {
                    ...sanitizeHtml.defaults.allowedAttributes,
                    '*': ['class', 'style', 'height', 'width'],
                },
                parser: {
                    lowerCaseTags: true,
                },
            },
            _config ?? {},
            {
                arrayMerge: (_d, s, _o) => s,
            },
        );
    }

    sanitize(body: string, options?: sanitizeHtml.IOptions) {
        return sanitizeHtml(
            body,
            merge(this.config, options ?? {}, {
                arrayMerge: (_d, s, _o) => s,
            }),
        );
    }
}
