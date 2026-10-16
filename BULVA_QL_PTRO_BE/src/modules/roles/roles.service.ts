import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';

import { Permission } from '../../domain/permission.entity.js';
import { RolePermission } from '../../domain/role-permissions.entity.js';
import { Role } from '../../domain/role.entity.js';
import { UserRole } from '../../domain/user-role.entity.js';
import { User } from '../../domain/user.entity.js';
import {
  AddPermissionsToRoleDto,
  AssignRolesToUserDto,
  CreateRoleDto,
  UpdateRoleDto,
} from './dto/role.dto.js';
import { PagedQueryDto } from '../../common/specifications/paged-query.dto.js';
import { UsersSpecification } from '../users/users.specification.js';
import { executePagedQuery } from '../../common/specifications/execute-paged-query.js';
import { RolesSpecification } from './roles.specification.js';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateRoleDto) {
    if (await this.roleRepository.existsBy({ name: dto.name })) {
      throw new ConflictException('Tên role đã tồn tại');
    }

    const roleId = await this.dataSource.transaction(async (manager) => {
      const roleRepository = manager.getRepository(Role);
      const permissionRepository = manager.getRepository(Permission);
      const rolePermissionRepository = manager.getRepository(RolePermission);

      const role = roleRepository.create({
        name: dto.name,
        description: dto.description ?? null,
        isSystem: false,
      });
      await roleRepository.save(role);

      const defaultPermissions = await permissionRepository.findBy({
        isDefault: true,
        isActive: true,
      });

      if (defaultPermissions.length > 0) {
        await rolePermissionRepository
          .createQueryBuilder()
          .insert()
          .into(RolePermission)
          .values(
            defaultPermissions.map((permission) => ({
              roleId: role.id,
              permissionId: permission.id,
            })),
          )
          .orIgnore()
          .execute();
      }

      return role.id;
    });

    return this.findOne(roleId);
  }

  async findAll(query: PagedQueryDto) {
    const roles = await this.roleRepository.find({
      relations: {
        rolePermissions: {
          permission: true,
        },
      },
      order: {
        name: 'ASC',
      },
    });

    const queryBuilder = this.roleRepository
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.rolePermissions', 'rolePermission')
      .leftJoinAndSelect('rolePermission.permission', 'permission');

    const result = await executePagedQuery(
      queryBuilder,
      new RolesSpecification(query),
    );

    // const filterRole = await this.roleRepository
    //   .createQueryBuilder('role')
    //   .leftJoinAndSelect('role.rolePermissions', 'rolePermission')
    //   .leftJoinAndSelect('rolePermission.permission', 'permission')
    //   .getMany();

    return {
      ...result,
      items: result.items.map((role) => this.toRoleResponse(role)),
    };

    // return roles.map((role) => this.toRoleResponse(role));

    // return executePagedQuery(
    //   this.userRepository.createQueryBuilder(),
    //   new UsersSpecification(query),
    // );
  }

  async findOne(id: string) {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: {
        rolePermissions: {
          permission: true,
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role không tồn tại');
    }

    return this.toRoleResponse(role);
  }

  async update(id: string, dto: UpdateRoleDto) {
    const role = await this.getRole(id);

    if (
      dto.name &&
      dto.name !== role.name &&
      (await this.roleRepository.existsBy({ name: dto.name }))
    ) {
      throw new ConflictException('Tên role đã tồn tại');
    }

    this.roleRepository.merge(role, {
      ...dto,
      ...(dto.description !== undefined && {
        description: dto.description ?? null,
      }),
    });
    await this.roleRepository.save(role);

    return this.findOne(id);
  }

  async remove(id: string) {
    const role = await this.getRole(id);

    if (role.isSystem) {
      throw new ConflictException('Không thể xoá system role');
    }

    await this.roleRepository.remove(role);

    return { deleted: true, id };
  }

  async assignRolesToUser(userId: string, dto: AssignRolesToUserDto) {
    await this.dataSource.transaction(async (manager) => {
      const userRepository = manager.getRepository(User);
      const roleRepository = manager.getRepository(Role);
      const userRoleRepository = manager.getRepository(UserRole);

      if (!(await userRepository.existsBy({ id: userId }))) {
        throw new NotFoundException('User không tồn tại');
      }

      const roles = await roleRepository.findBy({ id: In(dto.roleIds) });
      this.assertAllIdsExist(
        dto.roleIds,
        roles.map((role) => role.id),
        'Role không tồn tại',
      );

      await userRoleRepository
        .createQueryBuilder()
        .insert()
        .into(UserRole)
        .values(dto.roleIds.map((roleId) => ({ userId, roleId })))
        .orIgnore()
        .execute();
    });

    return this.findRolesByUser(userId);
  }

  async removeRoleFromUser(userId: string, roleId: string) {
    await Promise.all([this.assertUserExists(userId), this.getRole(roleId)]);

    const result = await this.userRoleRepository.delete({ userId, roleId });

    return {
      removed: Boolean(result.affected),
      userId,
      roleId,
    };
  }

  async findRolesByUser(userId: string) {
    await this.assertUserExists(userId);

    const userRoles = await this.userRoleRepository.find({
      where: { userId },
      relations: {
        role: true,
      },
    });

    return {
      userId,
      roles: userRoles
        .map((userRole) => userRole.role)
        .sort((left, right) => left.name.localeCompare(right.name)),
    };
  }

  async addPermissions(roleId: string, dto: AddPermissionsToRoleDto) {
    await this.dataSource.transaction(async (manager) => {
      const roleRepository = manager.getRepository(Role);
      const permissionRepository = manager.getRepository(Permission);
      const rolePermissionRepository = manager.getRepository(RolePermission);

      if (!(await roleRepository.existsBy({ id: roleId }))) {
        throw new NotFoundException('Role không tồn tại');
      }

      const permissions = await permissionRepository.findBy({
        id: In(dto.permissionIds),
        isActive: true,
      });
      this.assertAllIdsExist(
        dto.permissionIds,
        permissions.map((permission) => permission.id),
        'Permission không tồn tại hoặc đã bị vô hiệu hoá',
      );

      await rolePermissionRepository
        .createQueryBuilder()
        .insert()
        .into(RolePermission)
        .values(
          dto.permissionIds.map((permissionId) => ({
            roleId,
            permissionId,
          })),
        )
        .orIgnore()
        .execute();
    });

    return this.findOne(roleId);
  }

  async addPermission(roleId: string, permissionId: string) {
    await this.dataSource.transaction(async (manager) => {
      const roleRepository = manager.getRepository(Role);
      const permissionRepository = manager.getRepository(Permission);
      const rolePermissionRepository = manager.getRepository(RolePermission);

      if (!(await roleRepository.existsBy({ id: roleId }))) {
        throw new NotFoundException('Role không tồn tại');
      }

      const permissions = await permissionRepository.findBy({
        id: permissionId,
        isActive: true,
      });

      if (!permissions) {
        throw new NotFoundException(
          `Permission không tồn tại hoặc đã bị vô hiệu hoá`,
        );
      }

      await rolePermissionRepository
        .createQueryBuilder()
        .insert()
        .into(RolePermission)
        .values({ roleId, permissionId })
        .orIgnore()
        .execute();
    });

    return this.findOne(roleId);
  }

  async removePermission(roleId: string, permissionId: string) {
    await this.getRole(roleId);
    if (!(await this.permissionRepository.existsBy({ id: permissionId }))) {
      throw new NotFoundException('Permission không tồn tại');
    }

    const result = await this.rolePermissionRepository.delete({
      roleId,
      permissionId,
    });

    return {
      removed: Boolean(result.affected),
      roleId,
      permissionId,
    };
  }

  private async getRole(id: string): Promise<Role> {
    const role = await this.roleRepository.findOneBy({ id });
    if (!role) {
      throw new NotFoundException('Role không tồn tại');
    }
    return role;
  }

  private async assertUserExists(id: string): Promise<void> {
    if (!(await this.userRepository.existsBy({ id }))) {
      throw new NotFoundException('User không tồn tại');
    }
  }

  private assertAllIdsExist(
    requestedIds: string[],
    foundIds: string[],
    message: string,
  ): void {
    const found = new Set(foundIds);
    const missingIds = requestedIds.filter((id) => !found.has(id));

    if (missingIds.length > 0) {
      throw new NotFoundException(`${message}: ${missingIds.join(', ')}`);
    }
  }

  private toRoleResponse(role: Role) {
    const { rolePermissions = [], ...data } = role;

    return {
      ...data,
      permissions: rolePermissions
        .map((rolePermission) => rolePermission.permission)
        .filter((permission) => permission?.isActive)
        .sort((left, right) => left.name.localeCompare(right.name)),
    };
  }
}
