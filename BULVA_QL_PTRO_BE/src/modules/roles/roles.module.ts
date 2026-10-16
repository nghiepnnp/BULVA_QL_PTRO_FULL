import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RolePermission } from '../../domain/role-permissions.entity.js';
import { Permission } from '../../domain/permission.entity.js';
import { UserRole } from '../../domain/user-role.entity.js';
import { User } from '../../domain/user.entity.js';
import { Role } from '../../domain/role.entity.js';
import { RoleController } from './roles.controller.js';
import { RoleService } from './roles.service.js';
import { UserRolesController } from './user-roles.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Role,
      User,
      Permission,
      UserRole,
      RolePermission,
    ]),
  ],
  controllers: [RoleController, UserRolesController],
  providers: [RoleService],
  exports: [RoleService],
})
export class RolesModule {}
