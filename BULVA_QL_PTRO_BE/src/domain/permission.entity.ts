import { Entity, Column, Index, OneToMany, type Relation } from 'typeorm';
import { UuidV7Entity } from './base/uuid-v7.entity.js';
import type { RolePermission } from './role-permissions.entity.js';

@Entity('permissions')
@Index('UQ_permissions_active_name', ['name'], {
  unique: true,
  where: '"isActive" = true',
})
export class Permission extends UuidV7Entity {
  @Column({ type: 'varchar', length: 100, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 300 })
  name: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  description: string | null;

  // Default permission in new role
  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  // Disabed when delete in source define
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany('RolePermission', 'permission')
  rolePermissions: Relation<RolePermission[]>;
}
