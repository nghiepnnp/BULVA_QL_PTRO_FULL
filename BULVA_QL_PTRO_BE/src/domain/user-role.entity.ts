import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  type Relation,
} from 'typeorm';
import type { Role } from './role.entity.js';
import type { User } from './user.entity.js';

@Entity('user_roles')
export class UserRole {
  @PrimaryColumn('uuid')
  userId: string;

  @PrimaryColumn('uuid')
  roleId: string;

  @ManyToOne('User', 'userRoles', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Relation<User>;

  @ManyToOne('Role', 'userRoles', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roleId' })
  role: Relation<Role>;
}
