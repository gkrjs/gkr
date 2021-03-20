import {
    IsMatch,
    IsMatchPhone,
    IsModelExist,
    IsPassword,
    IsUnique,
    IsUniqueExist,
    tBoolean,
} from '@/core';
import { Injectable } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsBoolean,
    IsDefined,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsNumberString,
    IsOptional,
    IsUUID,
    Length,
} from 'class-validator';
import { CaptchaDtoGroups, CaptchaType, UserDtoGroups } from '../constants';
import { UserEntity } from '../entities';

/**
 * 用户模块DTO的通用基础字段
 *
 * @export
 * @class BaseUserDto
 */
@Injectable()
export class GuestDto {
    @ApiProperty({
        description: '登录凭证,可以是用户名,手机号或邮箱地址',
    })
    @Length(5, 50, {
        message: '登录凭证长度必须为$constraint1到$constraint2',
        always: true,
    })
    @IsNotEmpty({ message: '登录凭证不得为空', always: true })
    readonly credential!: string;

    @ApiProperty({
        description: '用户名',
    })
    @IsUnique(
        { entity: UserEntity },
        {
            groups: [UserDtoGroups.REGISTER, UserDtoGroups.CREATE],
            message: '该用户名已被注册',
        },
    )
    @IsUniqueExist(
        { entity: UserEntity, ignore: 'id' },
        {
            groups: [UserDtoGroups.UPDATE, UserDtoGroups.BOUND],
            message: '该用户名已被注册',
        },
    )
    @Length(5, 50, {
        always: true,
        message: '用户名长度必须为$constraint1到$constraint2',
    })
    username!: string;

    @ApiPropertyOptional({
        description: '用户昵称',
    })
    @Length(3, 20, {
        always: true,
        message: '昵称必须为$constraint1到$constraint2',
    })
    @IsOptional({ always: true })
    nickname?: string;

    @ApiProperty({
        description: '用户密码',
    })
    @IsPassword(5, {
        message: '密码必须由小写字母,大写字母,数字以及特殊字符组成',
        always: true,
    })
    @Length(8, 50, {
        message: '密码长度不得少于$constraint1',
        always: true,
    })
    readonly password!: string;

    @ApiProperty({ description: '重复密码' })
    @IsMatch('password', { message: '两次输入密码不同', always: true })
    @IsNotEmpty({ message: '请再次输入密码以确认', always: true })
    readonly plainPassword!: string;

    @ApiProperty({ description: '验证码' })
    @IsNumberString(undefined, { message: '验证码必须为数字', always: true })
    @Length(6, 6, { message: '验证码长度错误', always: true })
    readonly code!: string;

    @ApiProperty({ description: '手机号' })
    @IsDefined({
        message: '手机号必须填写',
        always: true,
    })
    @IsUnique(
        { entity: UserEntity },
        {
            message: '手机号已被注册',
            groups: [
                CaptchaDtoGroups.PHONE_REGISTER,
                CaptchaDtoGroups.BOUND_PHONE,
                UserDtoGroups.CREATE,
            ],
        },
    )
    @IsModelExist(
        { entity: UserEntity, map: 'phone' },
        {
            message: '用户不存在',
            groups: [
                CaptchaDtoGroups.PHONE_LOGIN,
                CaptchaDtoGroups.PHONE_RESET_PASSWORD,
            ],
        },
    )
    @IsMatchPhone(
        undefined,
        { strictMode: true },
        {
            message: '手机格式错误,示例: +86.15005255555',
            always: true,
        },
    )
    phone!: string;

    @ApiProperty({ description: '邮箱地址' })
    @IsDefined({
        message: '邮箱地址必须填写',
        always: true,
    })
    @IsUnique(
        { entity: UserEntity },
        {
            message: '邮箱已被注册',
            groups: [
                CaptchaDtoGroups.EMAIL_REGISTER,
                CaptchaDtoGroups.BOUND_EMAIL,
                UserDtoGroups.CREATE,
            ],
        },
    )
    @IsModelExist(
        { entity: UserEntity, map: 'email' },
        {
            message: '用户不存在',
            groups: [
                CaptchaDtoGroups.EMAIL_LOGIN,
                CaptchaDtoGroups.PHONE_RETRIEVE_PASSWORD,
            ],
        },
    )
    @IsEmail(undefined, {
        message: '邮箱地址格式错误',
        always: true,
    })
    email!: string;

    @ApiProperty({
        description: '验证选项',
        enum: CaptchaType,
    })
    @IsEnum(CaptchaType)
    type!: CaptchaType;

    @ApiPropertyOptional({ description: '是否软删除', default: true })
    @Transform(({ value }) => (value ? tBoolean(value) : undefined))
    @IsBoolean({ always: true })
    @IsOptional({ always: true })
    trash?: boolean;

    @ApiProperty({ description: '用户UUID列表', type: [String] })
    @IsModelExist(UserEntity, {
        each: true,
        message: '指定的用户不存在',
        groups: [UserDtoGroups.DELETE_MULTIE],
    })
    @IsUUID(undefined, {
        each: true,
        message: 'ID格式错误',
        groups: [UserDtoGroups.DELETE_MULTIE],
    })
    @IsDefined({
        each: true,
        groups: [UserDtoGroups.DELETE_MULTIE],
        message: '用户ID必须指定',
    })
    users: UserEntity[] = [];
}
