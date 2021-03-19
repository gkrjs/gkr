import { Depends, ParseUUIDEntityPipe } from '@/core';
import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { ContentModule } from '../content.module';
import { CreateCommentDto } from '../dtos';
import { CommentEntity } from '../entities';
import { CommentService } from '../services';

/**
 * 评论控制器
 *
 * @export
 * @class CommentController
 */
@Depends(ContentModule)
@ApiTags('文章评论')
@Controller('comments')
export class CommentController {
    constructor(private commentService: CommentService) {}

    /**
     * 添加评论
     *
     * @param {CreateCommentDto} data
     * @return {*}
     * @memberof CommentController
     */
    @Post()
    async store(
        @Body()
        data: CreateCommentDto,
    ) {
        return this.commentService.create(data);
    }

    /**
     * 删除评论
     *
     * @param {CommentEntity} comment
     * @return {*}
     * @memberof CommentController
     */
    @ApiParam({ name: 'comment', type: String })
    @Delete(':comment')
    async destroy(
        @Param('comment', new ParseUUIDEntityPipe(CommentEntity))
        comment: CommentEntity,
    ) {
        return this.commentService.delete(comment);
    }
}
