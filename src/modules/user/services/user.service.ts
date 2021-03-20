import { QueryHook } from '@/core';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import {
    CreateUserDto,
    DeleteUserMultiDto,
    QueryUserDto,
    UpdateInfoDto,
    UpdatePassword,
    UpdateUserDto,
} from '../dtos';
import { UserEntity } from '../entities';
import { UserRepository } from '../repositories';

// 用户查询接口
type FindParams = {
    [key in keyof Omit<QueryUserDto, 'limit' | 'page'>]: QueryUserDto[key];
};

/**
 * 用户管理服务
 *
 * @export
 * @class UserService
 */
@Injectable()
export class UserService {
    constructor(protected readonly userRepository: UserRepository) {}

    /**
     * 创建用户
     *
     * @param {CreateUserDto} data
     * @returns
     * @memberof UserService
     */
    async create(data: CreateUserDto) {
        const user = await this.userRepository.save(data);
        return this.findOneById(user.id);
    }

    /**
     * 更新用户
     *
     * @param {UpdateUserDto} data
     * @returns
     * @memberof UserService
     */
    async update(data: UpdateUserDto | UpdateInfoDto) {
        const user = await this.userRepository.save(data);
        return this.findOneById(user.id);
    }

    async updatePassword(
        user: UserEntity,
        { password, oldPassword }: UpdatePassword,
    ) {
        const item = await this.findOneById(user.id, async (query) =>
            query.addSelect('user.password'),
        );
        if (item?.password !== oldPassword)
            throw new ForbiddenException('old password not matched');
        item.password = password;
        await this.userRepository.save(item);
        return item;
    }

    /**
     *删除文章
     *
     * @param {UserEntity} user
     * @param {boolean} [trash=true]
     * @return {*}
     * @memberof UserService
     */
    async delete(user: UserEntity, trash = true) {
        return trash
            ? this.userRepository.softDelete(user)
            : this.userRepository.delete(user);
    }

    /**
     * 删除多篇文章
     *
     * 如果查询的列表是回收站的则直接硬删除
     *
     * @param {DeleteUserMultiDto} { users }
     * @param {FindParams} query
     * @param {IPaginationOptions} options
     * @return {*}
     * @memberof UserService
     */
    async deleteMulti(
        { users }: DeleteUserMultiDto,
        query: FindParams,
        options: IPaginationOptions,
    ) {
        query.trashed
            ? await this.userRepository.remove(users)
            : await this.userRepository.softRemove(users);
        return this.paginate(query, options);
    }

    /**
     * 根据用户用户凭证查询用户
     *
     * @param {string} credential
     * @param {QueryHook<UserEntity>} [callback]
     * @returns
     * @memberof UserService
     */
    async findOneByCredential(
        credential: string,
        callback?: QueryHook<UserEntity>,
    ) {
        let query = this.userRepository.buildBaseQuery();
        if (callback) {
            query = await callback(query);
        }
        return query
            .where('user.username = :credential', { credential })
            .orWhere('user.phone = :credential', { credential })
            .orWhere('user.email = :credential', { credential })
            .getOne();
    }

    /**
     * 根据ID查询用户
     *
     * @param {string} id
     * @param {QueryHook<UserEntity>} [callback]
     * @returns
     * @memberof UserService
     */
    async findOneById(id: string, callback?: QueryHook<UserEntity>) {
        let query = this.userRepository.buildBaseQuery();
        if (callback) {
            query = await callback(query);
        }
        const user = await query.where('user.id = :id', { id }).getOne();
        if (!user) {
            throw new EntityNotFoundError(UserEntity, id);
        }
        return user;
    }

    /**
     * 根据对象条件查找用户,不存在则抛出异常
     *
     * @param {{ [key: string]: any }} condition
     * @param {QueryHook<UserEntity>} [callback]
     * @returns
     * @memberof UserService
     */
    async findOneByCondition(
        condition: { [key: string]: any },
        callback?: QueryHook<UserEntity>,
    ) {
        let query = this.userRepository.buildBaseQuery();
        let firstWhere = true;
        for (const key in condition) {
            if (firstWhere) {
                query = query.where(`user.${key} = :${key}`, {
                    [key]: condition[key],
                });
                firstWhere = false;
            } else {
                query = query.andWhere(`user.${key} = :${key}`, {
                    [key]: condition[key],
                });
            }
        }
        if (callback) {
            query = await callback(query);
        }
        const user = query.getOne();
        if (!user) {
            throw new EntityNotFoundError(
                UserEntity,
                Object.keys(condition).join(','),
            );
        }
        return user;
    }

    /**
     * 对查询结果进行分页
     *
     * @param {FindParams} params
     * @param {IPaginationOptions} options
     * @returns
     * @memberof UserService
     */
    async paginate(params: FindParams, options: IPaginationOptions) {
        const query = await this.getListQuery(params);
        return paginate<UserEntity>(query, options);
    }

    /**
     * 根据参数构建查询用户列表的Query
     *
     * @protected
     * @param {FindParams} [params={}]
     * @returns
     * @memberof UserService
     */
    protected async getListQuery(params: FindParams = {}) {
        const { actived, orderBy } = params;
        const condition: { [key: string]: any } = {};
        let query = this.userRepository.buildBaseQuery();
        if (actived !== undefined && typeof actived === 'boolean') {
            condition['user.actived'] = actived;
        }
        if (orderBy) {
            query = query.orderBy(`user.${orderBy}`, 'ASC');
        }
        if (Object.keys(condition).length > 0) {
            query = query.where(condition);
        }
        return query;
    }
}
