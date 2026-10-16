import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Permission } from '../../domain/permission.entity.js';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  findAllActive() {
    return this.permissionRepository.find({
      where: { isActive: true },
      order: { code: 'ASC' },
    });
  }

  async getUserPermissions(userId: string): Promise<Set<string>> {
    const permissions = await this.permissionRepository
      .createQueryBuilder('permission')
      .innerJoin('permission.rolePermissions', 'rolePermission')
      .innerJoin('rolePermission.role', 'role')
      .innerJoin('role.userRoles', 'userRole')
      .where('userRole.userId = :userId', {
        userId,
      })
      .andWhere('permission.isActive = true')
      .select('permission.name', 'name')
      .distinct(true)
      .getRawMany<{
        name: string;
      }>();

    return new Set(permissions.map((x) => x.name));
  }

  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions.has(permission);
  }
}
