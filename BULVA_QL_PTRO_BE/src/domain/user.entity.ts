import type { UserRole } from './user-role.entity.js';
import { Entity, Column, Unique, OneToMany, type Relation } from 'typeorm';
import { AuditableEntity } from '#/domain/base/auditable.entity';
import { LoginType, UserStatus } from '../common/enums/enum.js';
import { Exclude } from 'class-transformer';

@Entity('users')
@Unique(['email'])
export class User extends AuditableEntity {
  @Column({ type: 'varchar', length: 50, nullable: false })
  username: string;

  @Column({ type: 'varchar', length: 256, nullable: false })
  email: string;

  @Column({ select: false })
  @Exclude()
  password: string;

  @Column({ type: 'enum', enum: LoginType, default: LoginType.INTERNAL })
  loginType: LoginType;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING })
  status: UserStatus;

  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt: Date | null;

  @OneToMany('UserRole', 'user')
  userRoles: Relation<UserRole[]>;
}
