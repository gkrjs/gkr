import { CUtilConfigType, CUtilOptionType } from '@/core/common';
import { Type } from '@nestjs/common';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import Faker from 'faker';
import ora from 'ora';
import {
    EntityManager,
    ObjectType,
    OneToMany,
    OneToOne,
    SelectQueryBuilder,
} from 'typeorm';
import yargs from 'yargs';

/** ****************************** 数据库配置 **************************** */

/**
 * TypeOrm配置
 *
 * @export
 * @interface DatabaseConfig
 * @extends {(CUtilConfigType<T, {
 *             common: Record<string, any> & {
 *                 migrations?: Array<Type<any>>;
 *             } & DbAdditionalOption;
 *         }>)}
 * @template T
 */
export interface DatabaseConfig<
    T extends DbOption = DbOption
> extends CUtilConfigType<
        T,
        {
            common: Record<string, any> & {
                migrations?: Array<Type<any>>;
            } & DbAdditionalOption;
        }
    > {}
/**
 * 数据库连接配置
 */
export type DbOption = CUtilOptionType<
    TypeOrmModuleOptions &
        DbAdditionalOption & {
            migrations?: Array<Type<any>>;
        } & Record<string, any>
>;

/**
 * 插件模块中的数据库选项
 *
 * @export
 * @interface DbPluginOption
 */
export interface DbPluginOption {
    database?: {
        entities?: Array<
            | EntityClassOrSchema
            | { use: EntityClassOrSchema; connection?: string }
        >;
        repositories?: EntityClassOrSchema[];
        subscribers?: Array<
            Type<any> | { use: Type<any>; connection?: string }
        >;
    };
}

/**
 * 额外数据库选项,用于CLI工具
 */
type DbAdditionalOption = {
    seedRunner?: SeederConstructor;
    seeders?: SeederConstructor[];
    factories?: (() => DbFactoryOption<any, any>)[];
    paths?: {
        migration?: string;
    };
};

/** ****************************** CLI命令 **************************** */
/**
 * 基础命令参数类型
 */
export type TypeOrmArguments = yargs.Arguments<{
    connection?: string;
}>;

/**
 * 创建迁移参数类型
 *
 * @export
 * @interface MigrationCreateArguments
 * @extends {TypeOrmArguments}
 */
export interface MigrationCreateArguments extends TypeOrmArguments {
    name: string;
    outputJs: boolean;
}

/**
 * 自动生成迁移参数类型
 *
 * @export
 * @interface MigrationGenerateArguments
 * @extends {TypeOrmArguments}
 */
export interface MigrationGenerateArguments extends TypeOrmArguments {
    name: string;
    run: boolean;
    dir?: string;
    pretty: boolean;
    outputJs: boolean;
    dryrun: boolean;
    check: boolean;
}

/**
 * 运行迁移参数类型
 *
 * @export
 * @interface MigrationRunArguments
 * @extends {TypeOrmArguments}
 */
export interface MigrationRunArguments extends TypeOrmArguments {
    transaction?: string;
    seed: boolean;
    generate: boolean;
}

/**
 * 回滚迁移参数类型
 *
 * @export
 * @interface MigrationRevertArguments
 * @extends {TypeOrmArguments}
 */
export interface MigrationRevertArguments extends TypeOrmArguments {
    transaction?: string;
}

/**
 * 刷新迁移参数类型
 *
 * @export
 * @interface MigrationRefreshArguments
 * @extends {TypeOrmArguments}
 */
export interface MigrationRefreshArguments extends TypeOrmArguments {
    transaction?: string;
    onlydrop: boolean;
    seed: boolean;
    generate: boolean;
}

export interface SeederArguments extends TypeOrmArguments {
    transaction: boolean;
}

/** ****************************** 数据填充 **************************** */

export interface SeederLoadParams {
    em: EntityManager;
    factorier?: DbFactory;
    factories: FactoryOptions;
}

/**
 * Seeder类对象接口
 *
 * @export
 * @interface Seeder
 */
export interface Seeder {
    load: (params: SeederLoadParams) => Promise<void>;
}

/**
 * Seeder类构造器
 *
 * @export
 * @interface SeederConstructor
 */
export interface SeederConstructor {
    new (spinner: ora.Ora, args: SeederArguments): Seeder;
}

/**
 * Factory构造器
 */
export type DbFactoryBuilder = (
    em: EntityManager,
    factories: {
        [entityName: string]: DbFactoryOption<any, any>;
    },
) => DbFactory;

/**
 * Factory解析器
 */
export interface DbFactory {
    <Entity>(entity: ObjectType<Entity>): <Options>(options?: Options) => any;
}

/**
 * Factory处理器
 */
export type DbFactoryHandler<E, O> = (
    faker: typeof Faker,
    options: O,
) => Promise<E>;

/**
 * Factory定义器
 */
export type DefineFactory = <E, O>(
    entity: ObjectType<E>,
    handler: DbFactoryHandler<E, O>,
) => () => DbFactoryOption<E, O>;

/**
 * Factory解析后的元数据
 */
export type DbFactoryOption<E, O> = {
    entity: ObjectType<E>;
    handler: DbFactoryHandler<E, O>;
};

export type FactoryOptions = {
    [entityName: string]: DbFactoryOption<any, any>;
};

/**
 * Factory自定义参数覆盖
 */
export type FactoryOverride<Entity> = {
    [Property in keyof Entity]?: Entity[Property];
};
/** ****************************** 数据操作 **************************** */
/**
 * 为query添加查询的回调函数接口
 */
export type QueryHook<Entity> = (
    hookQuery: SelectQueryBuilder<Entity>,
) => Promise<SelectQueryBuilder<Entity>>;

/**
 * 动态关联接口
 *
 * @export
 * @interface DynamicRelation
 */
export interface DynamicRelation {
    relation: ReturnType<typeof OneToOne> | ReturnType<typeof OneToMany>;
    column: string;
}
