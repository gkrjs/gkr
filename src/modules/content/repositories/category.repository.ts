import { EntityRepository, SelectQueryBuilder, TreeRepository } from 'typeorm';
import { CategoryEntity } from '../entities';

/**
 * 自定义分类模型的Repository
 *
 * @export
 * @class CategoryRepository
 * @extends {TreeRepository<CategoryEntity>}
 */
@EntityRepository(CategoryEntity)
export class CategoryRepository extends TreeRepository<CategoryEntity> {
    /**
     * 为根分类列表查询添加排序
     *
     * @returns {Promise<CategoryEntity[]>}
     * @memberof CategoryRepository
     */
    findRoots(): Promise<CategoryEntity[]> {
        const escapeAlias = (alias: string) =>
            this.manager.connection.driver.escape(alias);
        const escapeColumn = (column: string) =>
            this.manager.connection.driver.escape(column);
        const parentPropertyName = this.manager.connection.namingStrategy.joinColumnName(
            this.metadata.treeParentRelation!.propertyName,
            this.metadata.primaryColumns[0].propertyName,
        );

        return this.createQueryBuilder('treeEntity')
            .orderBy('treeEntity.order', 'ASC')
            .where(
                `${escapeAlias('treeEntity')}.${escapeColumn(
                    parentPropertyName,
                )} IS NULL`,
            )
            .getMany();
    }

    /**
     * 为子孙分类查询器添加排序
     *
     * @param {string} alias
     * @param {string} closureTableAlias
     * @param {CategoryEntity} entity
     * @returns {SelectQueryBuilder<CategoryEntity>}
     * @memberof CategoryRepository
     */
    createDescendantsQueryBuilder(
        alias: string,
        closureTableAlias: string,
        entity: CategoryEntity,
    ): SelectQueryBuilder<CategoryEntity> {
        return super
            .createDescendantsQueryBuilder(alias, closureTableAlias, entity)
            .orderBy(`${alias}.order`, 'ASC');
    }

    /**
     * 为祖先分类查询器添加排序
     *
     * @param {string} alias
     * @param {string} closureTableAlias
     * @param {CategoryEntity} entity
     * @returns {SelectQueryBuilder<CategoryEntity>}
     * @memberof CategoryRepository
     */
    createAncestorsQueryBuilder(
        alias: string,
        closureTableAlias: string,
        entity: CategoryEntity,
    ): SelectQueryBuilder<CategoryEntity> {
        return super
            .createAncestorsQueryBuilder(alias, closureTableAlias, entity)
            .orderBy(`${alias}.order`, 'ASC');
    }

    /**
     * 打平并展开树,直接输出扁平化分类列表
     *
     * @param {CategoryEntity[]} trees
     * @param {string[]} [relations=[]]
     * @returns {Promise<CategoryEntity[]>}
     * @memberof CategoryRepository
     */
    async toFlatTrees(
        trees: CategoryEntity[],
        level = 0,
        relations: string[] = [],
    ): Promise<CategoryEntity[]> {
        const data: CategoryEntity[] = [];
        for (const tree of trees) {
            const item = await this.findOneOrFail(tree.id, {
                relations,
            });
            item.level = level;
            data.push(item!);
            data.push(
                ...(await this.toFlatTrees(
                    tree.children,
                    level + 1,
                    relations,
                )),
            );
        }
        return data;
    }
}
