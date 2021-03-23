import { SetMetadata } from '@nestjs/common';
import { ALLOW_GUEST } from '../constants';

export const Public = () => SetMetadata(ALLOW_GUEST, true);
