import 'dotenv/config';

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DataSource } from 'typeorm';

import { User } from '../domain/user.entity.js';
import { Role } from '../domain/role.entity.js';
import { Permission } from '../domain/permission.entity.js';
import { UserRole } from '../domain/user-role.entity.js';
import { RolePermission } from '../domain/role-permissions.entity.js';
import { OtpChallenge } from '../domain/otp-challenge.entity.js';

const currentDirectory = dirname(fileURLToPath(import.meta.url));

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  uuidExtension: 'pgcrypto',

  entities: [User, Role, UserRole, RolePermission, Permission, OtpChallenge],

  migrations: [join(currentDirectory, 'migrations/*{.ts,.js}')],

  synchronize: false,
});

export default AppDataSource;
