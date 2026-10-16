import {
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  type Relation,
} from 'typeorm';
import type { Role } from './role.entity.js';
import type { Permission } from './permission.entity.js';

@Entity('role_permissions')
export class RolePermission {
  @PrimaryColumn({ type: 'uuid' })
  roleId: string;

  @PrimaryColumn({ type: 'uuid' })
  permissionId: string;

  @ManyToOne('Role', 'rolePermissions', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roleId' })
  role: Relation<Role>;

  @ManyToOne('Permission', 'rolePermissions', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permissionId' })
  permission: Relation<Permission>;
}
