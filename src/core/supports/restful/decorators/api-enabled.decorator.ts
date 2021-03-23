import { SetMetadata } from '@nestjs/common';
import { CONTROLLER_API_ENABLED } from '../constants';

export const APIEnabled = (check: () => boolean) =>
    SetMetadata(CONTROLLER_API_ENABLED, check);
