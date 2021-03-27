import { IsModelExist } from '@/core';
import { Injectable } from '@nestjs/common';
import { IsDefined, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { getManager } from 'typeorm';
import { UserEntity } from '../entities';
import { UserRepository } from '../repositories';

@Injectable()
export class WSAuthDto {
    @IsDefined({
        message: 'Token必须填写',
    })
    token!: string;
}

export class WSMessageDto extends WSAuthDto {
    @IsOptional()
    title?: string;

    @IsNotEmpty({
        message: '消息内容必须填写',
    })
    body!: string;

    @IsModelExist(UserEntity, {
        each: true,
        message: '指定的用户不存在',
    })
    @IsUUID(undefined, {
        each: true,
        message: 'ID格式错误',
    })
    @IsDefined({
        each: true,
        message: '用户ID必须指定',
    })
    receivers: UserEntity[] = [];

    @IsOptional()
    type?: string;

    async transform(obj: WSMessageDto) {
        const em = getManager();
        obj.receivers = await em
            .getCustomRepository(UserRepository)
            .findByIds(obj.receivers);
        return obj;
    }
}
