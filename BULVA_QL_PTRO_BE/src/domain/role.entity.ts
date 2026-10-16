import { Entity, Column, OneToMany, type Relation } from 'typeorm';
import { AuditableEntity } from '#/domain/base/auditable.entity';
import type { RolePermission } from './role-permissions.entity.js';
import type { UserRole } from './user-role.entity.js';

@Entity('roles')
export class Role extends AuditableEntity {
  @Column({ type: 'varchar', length: 200, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  description: string | null;

  @Column({ default: false })
  isSystem: boolean;

  @OneToMany('RolePermission', 'role')
  rolePermissions: Relation<RolePermission[]>;

  @OneToMany('UserRole', 'role')
  userRoles: Relation<UserRole[]>;
}
