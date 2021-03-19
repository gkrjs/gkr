/**
 * 文章排序类型
 *
 * @export
 * @enum {number}
 */
export enum PostOrderType {
    CREATED = 'createdAt',
    UPDATED = 'updatedAt',
    PUBLISHED = 'publishedAt',
    COMMENTCOUNT = 'commentCount',
}

/**
 * 文章内容类型
 *
 * @export
 * @enum {number}
 */
export enum PostBodyType {
    HTML = 'html',
    MD = 'markdown',
}
