import {
    Connection,
    EntityManager,
    EntitySubscriberInterface,
    EventSubscriber,
    getConnection,
    ObjectType,
    UpdateEvent,
} from 'typeorm';

/**
 * TypeOrm提供者基础类
 *
 * @export
 * @abstract
 * @class BaseSubscriber
 * @implements {EntitySubscriberInterface<T>}
 * @template T
 */
@EventSubscriber()
export abstract class BaseSubscriber<T>
    implements EntitySubscriberInterface<T> {
    /**
     * 指定提供者所用的连接名称
     * 有PluginModule种的subscibers选项指定,不可更改
     *
     * @protected
     * @type {string}
     * @memberof BaseSubscriber
     */
    private readonly cname!: string;

    protected connection!: Connection;

    protected em!: EntityManager;

    /**
     * 如果有自动注入的连接实例则属于Nestjs运行时否则处于cli状态
     * @memberof BaseSubscriber
     */
    constructor() {
        this.connection = this.getConnection();
        this.em = this.connection.manager;
    }

    abstract listenTo(): ObjectType<T>;

    protected getConnection(): Connection {
        return getConnection(this.cname);
    }

    protected getConnectName() {
        return this.cname;
    }

    /**
     * 在数据更新时判断某个字段是否被更新
     *
     * @protected
     * @template E
     * @param {keyof E} cloumn
     * @param {UpdateEvent<E>} event
     * @return {*}
     * @memberof BaseSubscriber
     */
    protected isUpdated<E>(cloumn: keyof E, event: UpdateEvent<E>): any {
        return event.updatedColumns.find(
            (item) => item.propertyName === cloumn,
        );
    }
}
