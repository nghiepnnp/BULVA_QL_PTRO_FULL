import { Module } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UsersController } from './users.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../domain/user.entity.js';
import { PermissionsModule } from '../permissions/permissions.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([User]), PermissionsModule],

  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
