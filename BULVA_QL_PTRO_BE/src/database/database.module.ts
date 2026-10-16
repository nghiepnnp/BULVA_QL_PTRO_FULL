import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditableEntitySubscriber } from '#/common/subscribers/auditable-entity.subscriber';
import { EnvService } from '../config/env/env.service.js';
import { OtpChallenge } from '../domain/otp-challenge.entity.js';
import { Permission } from '../domain/permission.entity.js';
import { User } from '../domain/user.entity.js';
import { Role } from '../domain/role.entity.js';
import { UserRole } from '../domain/user-role.entity.js';
import { RolePermission } from '../domain/role-permissions.entity.js';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [EnvService],
      useFactory: (config: EnvService) => ({
        type: 'postgres',
        host: config.dbHost,
        port: config.dbPort,

        username: config.dbUsername,
        password: config.dbPassword,
        database: config.dbDatabase,
        uuidExtension: 'pgcrypto',

        autoLoadEntities: true,

        // Khi dùng migration: Thì không nên bật
        synchronize: false,
      }),
    }),

  ],
  providers: [AuditableEntitySubscriber],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
