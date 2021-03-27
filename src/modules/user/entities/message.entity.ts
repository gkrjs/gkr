import { entityDate } from '@/core';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('user_messages')
export class MessageEntity extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    /**
     * 文章标题
     *
     * @type {string}
     * @memberof PostEntity
     */
    @Column({ comment: '消息标题(没有就是alert消息)', nullable: true })
    title?: string;

    @Column({ comment: '消息内容', type: 'longtext' })
    body!: string;

    @Column({
        comment: '消息类型(用于前台根据类型显示图标,点开链接地址等)',
        nullable: true,
    })
    type?: string;

    @Column({ comment: '是否已读', default: false })
    readed?: boolean;

    @CreateDateColumn({
        comment: '创建时间',
        transformer: entityDate(),
    })
    created_at!: Date;

    @UpdateDateColumn({
        comment: '更新时间',
        transformer: entityDate(),
    })
    updated_at!: Date;

    @ManyToOne((type) => UserEntity, (user) => user.sends, {
        onDelete: 'CASCADE',
    })
    sender!: UserEntity;

    @ManyToMany((type) => UserEntity, (user) => user.messages)
    @JoinTable()
    receivers!: UserEntity[];
}
