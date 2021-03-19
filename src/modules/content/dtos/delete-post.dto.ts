import { DtoValidation, tBoolean } from '@/core';
import { Injectable } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

/**
 * 文章列表查询数据验证
 *
 * @export
 * @class QueryPostDto
 */
@Injectable()
@DtoValidation()
export class DeletePostDto {
    @ApiPropertyOptional({ description: '是否软删除', default: true })
    @Transform(({ value }) => tBoolean(value))
    @IsBoolean()
    @IsOptional()
    trash?: boolean;
}
