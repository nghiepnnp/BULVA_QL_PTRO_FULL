import { SendMailModule } from './modules/send-mail/send-mail.module.js';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';

import { GlobalExceptionFilter } from './common/filters/global-exception.filter.js';
import { EnvModule } from './config/env/env.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { CommonModule } from './common/common.module.js';
import { DatabaseModule } from './database/database.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PermissionsModule } from './modules/permissions/permissions.module.js';
import { RolesModule } from './modules/roles/roles.module.js';
import { JwtPassportAuthGuard } from '#/common/guards/jwt-passport-auth.guard';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    SendMailModule,
    EnvModule,
    DatabaseModule,
    CommonModule,
    AuthModule,
    UsersModule,
    PermissionsModule,
    RolesModule,
  ],

  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtPassportAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    AppService,
  ],
})
export class AppModule {}
