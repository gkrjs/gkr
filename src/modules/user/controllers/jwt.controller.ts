import { Depends } from '@/core';
import { Controller, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards';
import { UserModule } from '../user.module';

/**
 * 添加JWT守卫的基础控制器
 *
 * @export
 * @abstract
 * @class JWTController
 * @extends {BaseController}
 */

@Controller()
@Depends(UserModule)
@UseGuards(JwtAuthGuard)
export abstract class JWTController {}
