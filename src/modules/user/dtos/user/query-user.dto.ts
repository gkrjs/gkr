import { DtoValidation } from '@/core';
import { Injectable } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber } from 'class-validator';
import { UserOrderType } from '../../constants';

/**
 * 查询用户列表的Query数据验证
 *
 * @export
 * @class QueryUserDto
 */
@Injectable()
@DtoValidation({
    type: 'query',
    skipMissingProperties: true,
})
export class QueryUserDto {
    /**
     * 过滤激活状态
     *
     * @type {boolean}
     * @memberof QueryUserDto
     */
    @ApiPropertyOptional({
        description: '根据激活状态筛选',
    })
    @Transform(({ value }) => JSON.parse(value.toLowerCase()))
    @IsBoolean()
    actived?: boolean;

    /**
     * 排序规则
     *
     * @type {UserOrderType}
     * @memberof QueryUserDto
     */
    @ApiPropertyOptional({
        description: '排序规则',
        enum: UserOrderType,
    })
    @IsEnum(UserOrderType)
    orderBy?: UserOrderType;

    /**
     * 当前分页
     *
     * @memberof QueryUserDto
     */
    @ApiPropertyOptional({
        description: '当前页',
        default: 1,
    })
    @Transform((value) => Number(value))
    @IsNumber()
    page = 1;

    /**
     * 每页显示数据量
     *
     * @memberof QueryUserDto
     */
    @ApiPropertyOptional({
        description: '每页显示数量',
        default: 10,
    })
    @Transform((value) => Number(value))
    @IsNumber()
    limit = 10;
}
