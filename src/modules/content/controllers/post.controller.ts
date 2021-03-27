import { Depends, ParseUUIDEntityPipe } from '@/core';
import { ReqUser } from '@/modules/user';
import { UserEntity } from '@/modules/user/entities';
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    SerializeOptions,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { ContentModule } from '../content.module';
import {
    CreatePostDto,
    DeletePostDto,
    QueryPostDto,
    UpdatePostDto,
} from '../dtos';
import { DeletePostMultiDto } from '../dtos/delete-post-multi.dto';
import { PostEntity } from '../entities';
import { PostService } from '../services';

/**
 * 文章控制器
 *
 * @export
 * @class PostController
 */
@Depends(ContentModule)
@ApiTags('文章内容')
@Controller('posts')
export class PostController {
    constructor(protected postService: PostService) {}

    /**
     * 查询文章列表
     *
     * @param {QueryPostDto} { page, limit, ...params }
     * @return {*}
     * @memberof PostController
     */
    @Get()
    async index(
        @Query()
        { page, limit, ...params }: QueryPostDto,
    ) {
        return this.postService.paginate(params, { page, limit });
    }

    /**
     * 查询一篇文章
     *
     * @param {string} post
     * @return {*}
     * @memberof PostController
     */
    @Get(':post')
    @SerializeOptions({ groups: ['post-item'] })
    async show(
        @Param('post', new ParseUUIDEntityPipe(PostEntity, false)) post: string,
    ) {
        return this.postService.findOne(post);
    }

    @Post()
    @SerializeOptions({ groups: ['post-item'] })
    async store(
        @ReqUser() user: UserEntity,
        @Body()
        data: CreatePostDto,
    ) {
        return this.postService.create(user, data);
    }

    @Patch()
    @SerializeOptions({ groups: ['post-item'] })
    async update(
        @Body()
        data: UpdatePostDto,
    ) {
        return this.postService.update(data);
    }

    @ApiParam({ name: 'post', type: String })
    @Delete(':post')
    @SerializeOptions({ groups: ['post-item'] })
    async destroy(
        @Body()
        { trash }: DeletePostDto,
        @Param('post', new ParseUUIDEntityPipe(PostEntity))
        post: PostEntity,
    ) {
        return this.postService.delete(post, trash);
    }

    @Delete()
    async destroyMulti(
        @Query()
        { page, limit, ...params }: QueryPostDto,
        @Body()
        data: DeletePostMultiDto,
    ) {
        return this.postService.deleteMulti(data, params, { page, limit });
    }
}
