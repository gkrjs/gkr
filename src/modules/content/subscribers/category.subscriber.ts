import { BaseSubscriber } from '@/core';
import { EventSubscriber, RemoveEvent } from 'typeorm';
import { CategoryEntity } from '../entities';
import { CategoryRepository } from '../repositories';

@EventSubscriber()
export class CategorySubscriber extends BaseSubscriber<CategoryEntity> {
    listenTo() {
        return CategoryEntity;
    }

    /**
     * 删除父分类则重置子分类
     *
     * @param {RemoveEvent<CategoryEntity>} event
     * @memberof CategorySubscriber
     */
    async beforeRemove(event: RemoveEvent<CategoryEntity>) {
        const repo = this.em.getCustomRepository(CategoryRepository);
        if (event.entity) {
            const tree = await repo.findDescendantsTree(event.entity);
            const children = tree.children ?? [];
            await Promise.all(
                children.map(async (child) => {
                    child.parent = null;
                    await this.em.save(child);
                    return true;
                }),
            );
        }
    }
}
