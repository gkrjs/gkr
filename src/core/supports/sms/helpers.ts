import { App } from '../../common';
import { SmsUtil } from './sms.util';

export const sms = () => App.utiler.get(SmsUtil);
