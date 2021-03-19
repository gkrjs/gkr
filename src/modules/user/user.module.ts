import {
    DbPluginOption,
    DbUtil,
    HashUtil,
    MailerUtil,
    PluginModule,
    QueuePluginOption,
    QueueUtil,
    RedisUtil,
    SmsUtil,
    TimeUtil,
} from '@/core';
import { PassportModule } from '@nestjs/passport';
import { SEND_CAPTCHA_QUEUE } from './constants';
import * as dtoMaps from './dtos';
import * as entities from './entities';
import * as guardMaps from './guards';
import { SendCaptchaProcessor } from './processors/send-captcha.processor';
import * as repositories from './repositories';
import * as serviceMaps from './services';
import * as strategyMaps from './strategies';
import * as subscribers from './subscribers';

const strategies = Object.values(strategyMaps);
const services = Object.values(serviceMaps);
const dtos = Object.values(dtoMaps);
const guards = Object.values(guardMaps);
@PluginModule<DbPluginOption & QueuePluginOption>(() => ({
    utils: [
        TimeUtil,
        DbUtil,
        HashUtil,
        RedisUtil,
        SmsUtil,
        QueueUtil,
        MailerUtil,
    ],
    queue: {
        producers: [{ name: SEND_CAPTCHA_QUEUE }],
        consumers: [SendCaptchaProcessor],
    },
    database: {
        entities: Object.values(entities),
        repositories: Object.values(repositories),
        subscribers: Object.values(subscribers),
    },
    imports: [PassportModule, serviceMaps.AuthService.jwtModuleFactory()],
    providers: [...strategies, ...dtos, ...services, ...guards],
    exports: services,
}))
export class UserModule {}
