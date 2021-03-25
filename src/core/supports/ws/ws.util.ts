import { AppParams, BaseUtil } from '@/core/common';
import { WsAdapter } from '@nestjs/platform-ws';

export class WsUtil extends BaseUtil<any> {
    protected configMaps = undefined;

    protected create(config: any) {}

    created({ current }: Required<AppParams>) {
        current.useWebSocketAdapter(new WsAdapter(current));
    }
}
