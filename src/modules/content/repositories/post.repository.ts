import { EntityRepository, Repository } from 'typeorm';
import { CommentEntity, PostEntity } from '../entities';

/**
 * 自定义文章模型的Repository
 *
 * @export
 * @class PostRepository
 * @extends {Repository<PostEntity>}
 */
@EntityRepository(PostEntity)
export class PostRepository extends Repository<PostEntity> {
    /**
     * 构建基础Query
     * 包括查询文章关联的作者以及评论数等
     *
     * @returns
     * @memberof PostRepository
     */
    buildBaseQuery() {
        return this.createQueryBuilder('post')
            .withDeleted()
            .leftJoinAndSelect('post.categories', 'categories')
            .addSelect((subQuery) => {
                return subQuery
                    .select('COUNT(c.id)', 'count')
                    .from(CommentEntity, 'c')
                    .where('c.post.id = post.id');
            }, 'commentCount')
            .loadRelationCountAndMap('post.commentCount', 'post.comments');
    }
}
