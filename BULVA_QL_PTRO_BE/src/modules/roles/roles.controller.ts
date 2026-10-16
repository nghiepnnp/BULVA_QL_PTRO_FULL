import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { JwtPassportAuthGuard } from '#/common/guards/jwt-passport-auth.guard';
import {
  AddPermissionsToRoleDto,
  CreateRoleDto,
  UpdateRoleDto,
} from './dto/role.dto.js';
import { RoleService } from './roles.service.js';
import { PagedQueryDto } from '../../common/specifications/paged-query.dto.js';

@ApiTags('Roles')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'JWT is missing or invalid' })
@UseGuards(JwtPassportAuthGuard)
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @ApiOperation({ summary: 'Create a role' })
  @ApiCreatedResponse({ description: 'Role created successfully' })
  create(@Body() dto: CreateRoleDto) {
    return this.roleService.create(dto);
  }

  @Post('list')
  @ApiOperation({ summary: 'List all roles' })
  @ApiOkResponse({ description: 'Roles with their permissions' })
  findAll(@Body() query: PagedQueryDto) {
    return this.roleService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a role by ID' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Role ID' })
  @ApiOkResponse({ description: 'Role found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.roleService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a role' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Role ID' })
  @ApiOkResponse({ description: 'Role updated successfully' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRoleDto) {
    return this.roleService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a role' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Role ID' })
  @ApiOkResponse({ description: 'Role deleted successfully' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.roleService.remove(id);
  }

  @Post(':roleId/permissions')
  @ApiOperation({ summary: 'Add many permissions to a role' })
  @ApiParam({ name: 'roleId', format: 'uuid', description: 'Role ID' })
  @ApiCreatedResponse({ description: 'Permissions assigned to the role' })
  addPermissions(
    @Param('roleId', ParseUUIDPipe) roleId: string,
    @Body() dto: AddPermissionsToRoleDto,
  ) {
    return this.roleService.addPermissions(roleId, dto);
  }

  @Post(':roleId/permissions/:permissionId')
  @ApiOperation({ summary: 'Add permission to a role' })
  @ApiParam({ name: 'roleId', format: 'uuid', description: 'Role ID' })
  @ApiCreatedResponse({ description: 'Permissions assigned to the role' })
  addPermission(
    @Param('roleId', ParseUUIDPipe) roleId: string,
    @Param('permissionId', ParseUUIDPipe) permissionId: string,
  ) {
    return this.roleService.addPermission(roleId, permissionId);
  }

  @Delete(':roleId/permissions/:permissionId')
  @ApiOperation({ summary: 'Remove a permission from a role' })
  @ApiParam({ name: 'roleId', format: 'uuid', description: 'Role ID' })
  @ApiParam({
    name: 'permissionId',
    format: 'uuid',
    description: 'Permission ID',
  })
  @ApiOkResponse({ description: 'Permission removed from the role' })
  removePermission(
    @Param('roleId', ParseUUIDPipe) roleId: string,
    @Param('permissionId', ParseUUIDPipe) permissionId: string,
  ) {
    return this.roleService.removePermission(roleId, permissionId);
  }
}
