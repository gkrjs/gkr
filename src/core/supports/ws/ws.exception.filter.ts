import { ArgumentsHost, Catch } from '@nestjs/common';
import { isObject } from '@nestjs/common/utils/shared.utils';
import { MESSAGES } from '@nestjs/core/constants';
import { BaseWsExceptionFilter } from '@nestjs/websockets';
import WebSocket from 'ws';
@Catch()
export class WsExceptionFilter extends BaseWsExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        super.catch(exception, host);
    }

    public handleError(client: any, exception: any) {
        const result = super.handleError(client, exception);
        if (client instanceof WebSocket) {
            const error = exception.getError();
            const message = isObject(error)
                ? error
                : {
                      status: 'error',
                      message: error,
                  };
            client.send(JSON.stringify({ event: 'exception', data: message }));
        }
        return result;
    }

    public handleUnknownError(exception: any, client: any) {
        const result = super.handleUnknownError(exception, client);
        if (client instanceof WebSocket) {
            client.send(
                JSON.stringify({
                    event: 'exception',
                    data: {
                        status: 'error',
                        message: MESSAGES.UNKNOWN_EXCEPTION_MESSAGE,
                    },
                }),
            );
        }
        return result;
    }
}
