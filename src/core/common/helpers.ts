import { Module, ModuleMetadata, Type } from '@nestjs/common';
import { PartialType } from '@nestjs/swagger';
import chalk from 'chalk';
import fs from 'fs';
import { IPaginationMeta, Pagination } from 'nestjs-typeorm-paginate';
import ora from 'ora';
import { ObjectLiteral } from 'typeorm';
import { env } from '../configure/env';
import { BaseConfig } from '../configure/types';
import { App } from './app';
import { PaginateDto } from './types';

/** ****************************************** Base **************************************** */
/**
 * 用于请求验证中的number数据转义
 *
 * @export
 * @param {(string | number)} [value]
 * @return {*}
 */
export function tNumber(value?: string | number): number | undefined {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return Number(value);
    return value;
}

/**
 * 用于请求验证中的boolean数据转义
 *
 * @export
 * @param {(string | boolean)} [value]
 * @return {*}
 */
export function tBoolean(value?: string | boolean): boolean | undefined {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return JSON.parse(value.toLowerCase());
    return value;
}

/**
 * 类混淆装饰器(备用)
 *
 * @export
 * @param {any[]} mixins
 * @param {boolean} [override=false]
 * @return {*}
 */
export function Trait(mixins: any[], override = false) {
    return <T extends new (...args: any[]) => any>(target: T) => {
        mixins.forEach((mixin) => {
            Object.getOwnPropertyNames(mixin.prototype).forEach((name) => {
                if (override && Object.getOwnPropertyDescriptor(target, name)) {
                    Reflect.deleteProperty(target, name);
                }
                if (!Object.getOwnPropertyDescriptor(target, name)) {
                    Object.defineProperty(
                        target.prototype,
                        name,
                        Object.getOwnPropertyDescriptor(mixin.prototype, name)!,
                    );
                }
            });
        });
        return target;
    };
}

/**
 * 判断一个变量是否为promise对象
 *
 * @export
 * @param {*} o
 * @returns {boolean}
 */
export function isPromiseLike(o: any): boolean {
    return (
        !!o &&
        (typeof o === 'object' || typeof o === 'function') &&
        typeof o.then === 'function' &&
        !(o instanceof Date)
    );
}

/**
 * 手动分页函数
 *
 * @export
 * @template T
 * @param {PaginateDto} { page, limit }
 * @param {T[]} data
 * @return {*}  {Pagination<T>}
 */
export function manualPaginate<T extends ObjectLiteral>(
    { page, limit }: PaginateDto,
    data: T[],
): Pagination<T> {
    let items: T[] = [];
    const totalItems = data.length;
    const totalRst = totalItems / limit;
    const totalPages =
        totalRst > Math.floor(totalRst)
            ? Math.floor(totalRst) + 1
            : Math.floor(totalRst);
    let itemCount = 0;
    if (page <= totalPages) {
        itemCount =
            page === totalPages ? totalItems - (totalPages - 1) * limit : limit;
        const start = (page - 1) * limit;
        items = data.slice(start, start + itemCount);
    }
    const meta: IPaginationMeta = {
        itemCount,
        totalItems,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
    };
    return {
        meta,
        items,
    };
}

/** ****************************************** Console **************************************** */
interface PanicOption {
    message: string;
    spinner?: ora.Ora;
    error?: any;
    exit?: boolean;
}

/**
 * 命令行打应错误
 *
 * @export
 * @param {(PanicOption | string)} option
 */
export function panic(option: PanicOption | string) {
    console.log();
    if (typeof option === 'string') {
        console.log(chalk.red(`\n❌ ${option}`));
        process.exit(1);
    }
    const { error, spinner, message, exit = true } = option;
    if (error) console.log(chalk.red(error));
    spinner
        ? spinner.fail(chalk.red(`\n❌${message}`))
        : console.log(chalk.red(`\n❌ ${message}`));
    if (exit) process.exit(1);
}

/** ***************************       File       *********************************** */
export const isFile = (filePath: string): boolean =>
    fs.existsSync(filePath) && fs.lstatSync(filePath).isFile();

export const isDir = (dirPath: string): boolean =>
    fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory();

/** ****************************************** Framework **************************************** */
export function PartialDto<T>(classRef: Type<T>): Type<Partial<T>> {
    const PartialTypeClass = PartialType(classRef);
    if (
        classRef.prototype.transform &&
        typeof classRef.prototype.transform === 'function'
    ) {
        PartialTypeClass.prototype.transform = classRef.prototype.transform;
    }
    return PartialTypeClass;
}

/**
 * 是否为源代码运行环境
 *
 * @export
 * @return {*}
 */
export function isInSource() {
    return env('RUN_SOURCE', (v) => JSON.parse(v), false);
}

/**
 * 获取配置的快捷方法
 *
 * @export
 * @template T
 * @return {*}  {T}
 */
export function config<T extends BaseConfig = BaseConfig>(): T;
export function config<T = any>(key: string, defaultValue?: T): T;
export function config<T = any>(key?: string, defaultValue?: T) {
    if (typeof key === 'string') {
        return App.configure.get<T>(key, defaultValue);
    }
    return App.configure.all();
}

/**
 * 动态创建一个模块
 *
 * @export
 * @param {(string | Type<any>)} target
 * @param {() => ModuleMetadata} [metaSetter=() => ({})]
 * @return {*}
 */
export function CreateModule(
    target: string | Type<any>,
    metaSetter: () => ModuleMetadata = () => ({}),
): Type<any> {
    let ModuleClass: Type<any>;
    if (typeof target === 'string') {
        ModuleClass = class {};
        Object.defineProperty(ModuleClass, 'name', { value: target });
    } else {
        ModuleClass = target;
    }
    Module(metaSetter())(ModuleClass);
    return ModuleClass;
}
