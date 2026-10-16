import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
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
import { AssignRolesToUserDto } from './dto/role.dto.js';
import { RoleService } from './roles.service.js';

@ApiTags('User roles')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'JWT is missing or invalid' })
@ApiParam({ name: 'userId', format: 'uuid', description: 'User ID' })
@UseGuards(JwtPassportAuthGuard)
@Controller('users/:userId/roles')
export class UserRolesController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @ApiOperation({ summary: 'List roles assigned to a user' })
  @ApiOkResponse({ description: 'Roles assigned to the user' })
  findRoles(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.roleService.findRolesByUser(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Assign roles to a user' })
  @ApiCreatedResponse({ description: 'Roles assigned successfully' })
  assignRoles(
    @Param('userId', ParseUUIDPipe) userId: string, 
    @Body() dto: AssignRolesToUserDto,
  ) {
    return this.roleService.assignRolesToUser(userId, dto);
  }

  @Delete(':roleId')
  @ApiOperation({ summary: 'Remove a role from a user' })
  @ApiParam({ name: 'roleId', format: 'uuid', description: 'Role ID' })
  @ApiOkResponse({ description: 'Role removed from the user' })
  removeRole(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('roleId', ParseUUIDPipe) roleId: string,
  ) {
    return this.roleService.removeRoleFromUser(userId, roleId);
  }
}
