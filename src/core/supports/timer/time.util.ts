import { BaseUtil, UtilConfigMaps } from '@/core/common';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/zh-tw';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import localeData from 'dayjs/plugin/localeData';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

/**
 * 时间生成器参数接口
 */
export interface TimeOptions {
    date?: dayjs.ConfigType;
    format?: dayjs.OptionType;
    locale?: string;
    strict?: boolean;
    zonetime?: string;
}

dayjs.extend(localeData);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(dayOfYear);

/**
 * 时间类只是day.js库的代理类,用户生产新的day.js对象
 *
 * @export
 * @class TimeUtil
 * @extends {BaseUtil<{
 *     locale: string;
 *     timezone: string;
 * }>}
 */
export class TimeUtil extends BaseUtil<{
    locale: string;
    timezone: string;
}> {
    protected configMaps: UtilConfigMaps = {
        required: true,
        maps: { timezone: 'app.timezone', locale: 'app.locale' },
    };

    create(config: { locale: string; timezone: string }) {
        this.config = config;
    }

    /**
     * 传入配置,获取时间
     * language不设置则为全局配置的语言
     * zoneTime不设置则为全局配置的时区
     * 其它方法与day.js一样
     *
     * @param {TimeOptions} [options={}]
     * @returns {dayjs.Dayjs}
     * @memberof Time
     */
    getTime(options?: TimeOptions): dayjs.Dayjs {
        const { date, format, locale, strict, zonetime } = options ?? {};
        // 每次创建一个新的时间对象
        // 如果没有传入local或timezone则使用应用配置
        const now = dayjs(
            date,
            format,
            locale ?? this.config.locale,
            strict,
        ).clone();
        return now.tz(zonetime ?? this.config.timezone);
    }
}
