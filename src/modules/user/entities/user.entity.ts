import { AddRelations, config, entityDate } from '@/core';
import { Expose } from 'class-transformer';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { AccessTokenEntity } from './access-token.entity';
import { MessageEntity } from './message.entity';

/**
 * 用户模型
 *
 * @export
 * @class UserEntity
 */
@Entity('users')
@AddRelations(() => config('user.relations'))
export class UserEntity extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({
        comment: '姓名',
        nullable: true,
    })
    nickname?: string;

    @Column({ comment: '用户名', unique: true })
    username!: string;

    @Column({ comment: '密码', length: 500, select: false })
    password!: string;

    @Column({ comment: '手机号', nullable: true, unique: true })
    phone?: string;

    @Column({ comment: '邮箱', nullable: true, unique: true })
    email?: string;

    @Column({ comment: '用户状态,是否激活', default: true })
    actived?: boolean;

    @CreateDateColumn({
        comment: '用户创建时间',
        transformer: entityDate(),
    })
    createdAt!: Date;

    @UpdateDateColumn({
        comment: '更新时间',
        transformer: entityDate(),
    })
    updated_at!: Date;

    /**
     * 软删除时间
     *
     * @type {Date}
     * @memberof PostEntity
     */
    @DeleteDateColumn({ comment: '软删除' })
    deletedAt!: Date;

    /**
     * 用户的登录令牌
     *
     * @type {AccessTokenEntity[]}
     * @memberof UserEntity
     */
    @OneToMany(() => AccessTokenEntity, (accessToken) => accessToken.user, {
        cascade: true,
    })
    accessTokens!: AccessTokenEntity[];

    @OneToMany(() => MessageEntity, (message) => message.sender, {
        cascade: true,
    })
    sends!: MessageEntity[];

    @ManyToMany((type) => MessageEntity, (message) => message.receivers)
    messages!: MessageEntity[];

    /**
     * 是否位于回收站
     *
     * @type {boolean}
     * @memberof PostEntity
     */
    @Expose()
    trashed!: boolean;
}
