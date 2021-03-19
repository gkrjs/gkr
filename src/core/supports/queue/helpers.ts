import { BullModuleOptions } from '@nestjs/bull';
import { App } from '../../common';
import { QueueUtil } from './queue.util';

export const queue = () => App.utiler.get(QueueUtil);
export function addQueue(params: BullModuleOptions = {}) {
    return queue().addProducers(params);
}
