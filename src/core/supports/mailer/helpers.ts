import { App } from '../../common';
import { MailerUtil } from './mailer.util';

export const mailer = () => App.utiler.get(MailerUtil);
