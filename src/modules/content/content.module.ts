import {
    DbPluginOption,
    DbUtil,
    HtmlUtil,
    PluginModule,
    TimeUtil,
} from '@/core';
import * as DtoMaps from './dtos';
import * as EntityMaps from './entities';
import * as RepositoryMaps from './repositories';
import * as ServerMaps from './services';
import * as SubscriberMaps from './subscribers';

const entities = Object.values(EntityMaps);
const repositories = Object.values(RepositoryMaps);
const subscribers = Object.values(SubscriberMaps);
const dtos = Object.values(DtoMaps);
const services = Object.values(ServerMaps);

@PluginModule<DbPluginOption>(() => ({
    utils: [TimeUtil, DbUtil, HtmlUtil],
    database: { entities, repositories, subscribers },
    providers: [...dtos, ...services],
    exports: services,
}))
export class ContentModule {}
