import { CUtilConfigType, CUtilOptionType } from '@/core/common';
import { BullModuleOptions } from '@nestjs/bull';
import { Type } from '@nestjs/common';
import Bull from 'bull';

/**
 * 列队配置
 *
 * @export
 * @interface QueueConfig
 * @extends {CUtilConfigType<QueueOption>}
 */
export interface QueueConfig extends CUtilConfigType<QueueOption> {}

/**
 * 列队连接配置选项
 *
 * @export
 * @interface QueueOption
 * @extends {(CUtilOptionType<Omit<Bull.QueueOptions, 'redis'> & {
 *             redis?: string;
 *         }>)}
 */
export interface QueueOption
    extends CUtilOptionType<
        Omit<Bull.QueueOptions, 'redis'> & {
            redis?: string;
        }
    > {}
export interface QueuePluginOption {
    queue?: {
        producers?: BullModuleOptions[];
        consumers?: Type<any>[];
    };
}
