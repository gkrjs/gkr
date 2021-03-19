import { App } from '@/core/common';
import dayjs from 'dayjs';
import { ValueTransformer } from 'typeorm';
import { TimeOptions, TimeUtil } from './time.util';

const timer = () => App.utiler.get(TimeUtil);

/**
 * Time Util的快捷函数
 *
 * @export
 * @param {TimeOptions} [options]
 * @return {*}  {dayjs.Dayjs}
 */
export function time(options?: TimeOptions): dayjs.Dayjs {
    return timer().getTime(options);
}

export function entityDate(): ValueTransformer {
    return {
        from: (date) => date || time({ date }).unix().toString(),
        to: (date) => date,
    };
}
