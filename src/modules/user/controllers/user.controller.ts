import { Depends, ParseUUIDEntityPipe } from '@/core';
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Query,
    SerializeOptions,
    UseGuards,
} from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';
import { classToPlain } from 'class-transformer';
import {
    DeleteUserDto,
    DeleteUserMultiDto,
    QueryUserDto,
    UpdateUserDto,
} from '../dtos';
import { UserEntity } from '../entities';
import { JwtAuthGuard } from '../guards';
import { UserService } from '../services';
import { UserModule } from '../user.module';

/**
 * 用户管理控制器
 *
 * @export
 * @class UserManageController
 * @extends {BaseController}
 */
@Controller()
@Depends(UserModule)
export class UserController {
    constructor(private readonly userService: UserService) {}

    /**
     * 根据条件分页查询
     *
     * @param {QueryUserDto} { page, limit, actived }
     * @returns
     * @memberof UserManageController
     */
    @Get()
    @UseGuards(JwtAuthGuard)
    async index(@Query() { page, limit, actived }: QueryUserDto) {
        const result = await this.userService.paginate(
            {
                actived,
            },
            { page, limit },
        );
        return {
            ...result,
            items: classToPlain(result.items, {
                groups: ['user-list'],
            }),
        };
    }

    /**
     * 用户详细信息
     *
     * @param {UserEntity} user
     * @returns {Promise<UserEntity>}
     * @memberof UserManageController
     */
    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @SerializeOptions({
        groups: ['user-item'],
    })
    show(
        @Param('id', new ParseUUIDEntityPipe(UserEntity))
        user: UserEntity,
    ): Promise<UserEntity> {
        return this.userService.findOneById(user.id);
    }

    /**
     * 更新用户信息
     *
     * @param {UpdateUserDto} updateUserDto
     * @returns {Promise<UserEntity>}
     * @memberof UserManageController
     */
    @Patch()
    @UseGuards(JwtAuthGuard)
    @SerializeOptions({
        groups: ['user-item'],
    })
    async update(
        @Body()
        updateUserDto: UpdateUserDto,
    ): Promise<UserEntity> {
        return this.userService.update(updateUserDto);
    }

    @ApiParam({ name: 'user', type: String })
    @Delete(':user')
    @SerializeOptions({ groups: ['user-item'] })
    async destroy(
        @Body()
        { trash }: DeleteUserDto,
        @Param('user', new ParseUUIDEntityPipe(UserEntity))
        post: UserEntity,
    ) {
        return this.userService.delete(post, trash);
    }

    @Delete()
    async destroyMulti(
        @Query()
        { page, limit, ...params }: QueryUserDto,
        @Body()
        data: DeleteUserMultiDto,
    ) {
        return this.userService.deleteMulti(data, params, { page, limit });
    }
}
