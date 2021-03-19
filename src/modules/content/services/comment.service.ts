import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCommentDto } from '../dtos';
import { CommentEntity } from '../entities';

/**
 * 文章评论服务
 *
 * @export
 * @class CommentService
 */
@Injectable()
export class CommentService {
    constructor(
        @InjectRepository(CommentEntity)
        private commentRepository: Repository<CommentEntity>,
    ) {}

    /**
     * 创建评论
     *
     * @param {CreateCommentDto} data
     * @return {*}
     * @memberof CommentService
     */
    async create(data: CreateCommentDto) {
        const item = await this.commentRepository.save(data);
        return this.commentRepository.findOneOrFail(item.id);
    }

    /**
     * 删除评论
     *
     * @param {CommentEntity} comment
     * @return {*}
     * @memberof CommentService
     */
    async delete(comment: CommentEntity) {
        return this.commentRepository.remove(comment);
    }
}
