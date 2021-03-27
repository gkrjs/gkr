import {
    ArgumentsHost,
    Catch,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { isObject } from 'lodash';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { ClassType } from '../types';

@Catch()
export class AppFilter<T extends any = Error> extends BaseExceptionFilter<T> {
    protected resExceptions: Array<
        { class: ClassType<Error>; status?: number } | ClassType<Error>
    > = [{ class: EntityNotFoundError, status: HttpStatus.NOT_FOUND }];

    // eslint-disable-next-line consistent-return
    catch(exception: T, host: ArgumentsHost) {
        const applicationRef =
            this.applicationRef ||
            (this.httpAdapterHost && this.httpAdapterHost.httpAdapter)!;
        // 是否在自定义的异常处理类列表中
        const resException = this.resExceptions.find((item) =>
            'class' in item
                ? exception instanceof item.class
                : exception instanceof item,
        );

        // 如果不在自定义异常处理类列表也没有继承自HttpException
        if (!resException && !(exception instanceof HttpException)) {
            return this.handleUnknownError(exception, host, applicationRef);
        }
        // eslint-disable-next-line @typescript-eslint/ban-types
        let res: string | object = '';
        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        if (exception instanceof HttpException) {
            res = exception.getResponse();
            status = exception.getStatus();
        } else if (resException) {
            const e = exception as Error;
            res = e.message;
            if ('class' in resException && resException.status) {
                status = resException.status;
            }
        }
        const message = isObject(res)
            ? res
            : {
                  statusCode: status,
                  message: res,
              };

        applicationRef!.reply(host.getArgByIndex(1), message, status);
    }
}
