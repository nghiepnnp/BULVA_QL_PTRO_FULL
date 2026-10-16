import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PermissionGuard } from '../../common/guards/permission.guard.js';
import { Permission } from '../../domain/permission.entity.js';
import { PermissionSyncService } from './permission-sync.service.js';
import { PermissionsController } from './permissions.controller.js';
import { PermissionsService } from './permissions.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Permission])],
  controllers: [PermissionsController],
  providers: [PermissionSyncService, PermissionsService, PermissionGuard],
  exports: [PermissionSyncService, PermissionsService, PermissionGuard],
})
export class PermissionsModule {}
