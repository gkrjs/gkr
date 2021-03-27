import {
    getRandomIndex,
    isPreview,
    RedisUtil,
    time,
    WsExceptionFilter,
    WsPipe,
} from '@/core';
import { Injectable, UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsException,
    WsResponse,
} from '@nestjs/websockets';
import { classToPlain } from 'class-transformer';
import IORedis from 'ioredis';
import { pick } from 'lodash';
import WebSocket, { Server } from 'ws';
import { WSAuthDto, WSMessageDto } from '../dtos';
import { AccessTokenEntity, MessageEntity, UserEntity } from '../entities';
import { JwtWsGuard } from '../guards';
import { UserRepository } from '../repositories';
import { TokenService } from '../services';

interface Onliner {
    client: WebSocket;
    user: UserEntity;
    token: AccessTokenEntity;
}

@Injectable()
@WebSocketGateway()
@UseFilters(new WsExceptionFilter())
@UsePipes(
    new WsPipe({
        transform: true,
        forbidUnknownValues: true,
        validationError: { target: false },
    }),
)
export class WSGateway {
    protected redisClient: IORedis.Redis;

    protected _onliners: Onliner[] = [];

    constructor(
        protected redisUtil: RedisUtil,
        protected tokenService: TokenService,
        protected userRepository: UserRepository,
    ) {
        this.redisClient = this.redisUtil.getClient();
    }

    get onLiners() {
        return this._onliners;
    }

    @WebSocketServer()
    server!: Server;

    @UseGuards(JwtWsGuard)
    @SubscribeMessage('online')
    async onLine(
        @MessageBody() data: WSAuthDto,
        @ConnectedSocket() client: WebSocket,
    ): Promise<WsResponse<Record<string, any>>> {
        let token: AccessTokenEntity;
        if (isPreview()) {
            const now = time();
            const users = await this.userRepository.find();
            const user = users[getRandomIndex(users.length)];
            const rst = await this.tokenService.generateAccessToken(user, now);
            token = rst.accessToken;
        } else {
            token = (await this.tokenService.checkAccessToken(data.token))!;
        }
        await this.redisClient.sadd('online', token.value);
        const onliner = { token, user: token.user, client };
        this._onliners.push(onliner);
        client.on('close', async () => {
            client.terminate();
            await this.offline(onliner);
        });
        return {
            event: 'online',
            data: this.getUserInfo(token.user),
        };
    }

    @UseGuards(JwtWsGuard)
    @SubscribeMessage('message')
    async sendMessage(
        @MessageBody()
        data: WSMessageDto,
        @ConnectedSocket() client: WebSocket,
    ) {
        const { sender, receivers } = await this.getMessager(data);
        const onliners = this._onliners.filter((o) =>
            receivers.map((r) => r.id).includes(o.user.id),
        );

        const message = new MessageEntity();
        message.body = data.body;
        message.sender = sender;
        message.receivers = receivers;
        if (data.title) message.title = data.title;
        if (data.type) message.type = data.type;
        await message.save();
        onliners.forEach((o) =>
            o.client.send(
                JSON.stringify({
                    event: 'message',
                    message: classToPlain(message),
                }),
            ),
        );
    }

    @SubscribeMessage('exception')
    sendException(
        @MessageBody()
        data: {
            status: string;
            message: any;
        },
    ): WsResponse<Record<string, any>> {
        return { event: 'exception', data };
    }

    protected async getMessager(
        data: WSMessageDto,
    ): Promise<{ sender: UserEntity; receivers: UserEntity[] }> {
        const filterRS = (s: UserEntity, list: UserEntity[]) =>
            list.filter((u) => u.id !== s.id);
        if (isPreview()) {
            let allUsers: UserEntity[] = [];
            if (this._onliners.length < 1) {
                allUsers = await this.userRepository.find();
            }
            const onliner = this._onliners[
                getRandomIndex(this._onliners.length)
            ];
            const sender = onliner
                ? onliner.user
                : allUsers[getRandomIndex(this._onliners.length)];
            const onlineRS = filterRS(
                sender,
                this._onliners.map((o) => o.user),
            );
            const receivers: UserEntity[] = [
                ...onlineRS,
                ...filterRS(sender, data.receivers).filter(
                    (r) => !onlineRS.find((o) => o.id === r.id),
                ),
            ];
            return {
                sender,
                receivers,
            };
        }
        const token = (await this.tokenService.checkAccessToken(data.token))!;
        if (!this._onliners.find((o) => o.token.id === token.id)) {
            throw new WsException('You are not on line');
        }
        const sender = token.user;
        return {
            sender,
            receivers: filterRS(sender, data.receivers),
        };
    }

    protected async offline({ token }: Onliner) {
        try {
            await this.redisClient.srem('online', token.value);
            const users = await this.getOnlineUsers();
            this.server.clients.forEach((c) => c.send(JSON.stringify(users)));
            this._onliners = this._onliners.filter(
                (o) => o.user.id !== token.user.id,
            );
            // eslint-disable-next-line no-empty
        } catch (err) {}
    }

    protected async getOnlineUsers() {
        const tokens = await this.redisClient.smembers('online');
        return ((
            await Promise.all(
                tokens.map(async (t) => {
                    const token = await this.tokenService.checkAccessToken(t);
                    if (token) return token.user;
                    return undefined;
                }),
            )
        ).filter((u) => !!u) as UserEntity[]).reduce((o: UserEntity[], n) => {
            if (o.find((u) => u.id === n.id)) return o;
            return [...o, n];
        }, []);
    }

    protected getUserInfo(user: UserEntity) {
        return pick(classToPlain(user, { groups: ['user-item'] }), [
            'id',
            'username',
            'nickname',
            'phone',
            'email',
        ]);
    }
}
