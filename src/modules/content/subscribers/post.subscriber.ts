import { BaseSubscriber, cleanhtml, time } from '@/core';
import { EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm';
import { PostBodyType } from '../constants';
import { PostEntity } from '../entities';

/**
 * 文章模型观察者
 *
 * @export
 * @class PostSubscriber
 * @extends {BaseSubscriber<PostEntity>}
 */
@EventSubscriber()
export class PostSubscriber extends BaseSubscriber<PostEntity> {
    listenTo() {
        return PostEntity;
    }

    /**
     * 如果在添加文章的同时发布文章,则设置当前时间为发布时间
     *
     * @param {InsertEvent<PostEntity>} event
     * @memberof PostSubscriber
     */
    async beforeInsert(event: InsertEvent<PostEntity>) {
        if (event.entity.isPublished) {
            event.entity.publishedAt = time().toDate();
        }
    }

    /**
     * 更改发布状态会同时更新发布时间的值,
     * 如果文章更新为未发布状态,则把发布时间设置为null
     *
     * @param {UpdateEvent<PostEntity>} event
     * @memberof PostSubscriber
     */
    async beforeUpdate(event: UpdateEvent<PostEntity>) {
        if (this.isUpdated('isPublished', event)) {
            event.entity.publishedAt = event.entity.isPublished
                ? time().toDate()
                : null;
        }
    }

    async afterLoad(entity: PostEntity) {
        entity.trashed = !!entity.deletedAt;
        if (entity.type === PostBodyType.HTML) {
            entity.body = cleanhtml(entity.body);
        }
    }
}
