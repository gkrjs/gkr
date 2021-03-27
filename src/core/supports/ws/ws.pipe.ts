import { AppPipe } from '@/core/common/providers';
import { ArgumentMetadata } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

export class WsPipe extends AppPipe {
    async transform(value: any, metadata: ArgumentMetadata) {
        try {
            return await super.transform(value, metadata);
        } catch (err) {
            const error = err.response ?? err;
            throw new WsException(error);
        }
    }
}
