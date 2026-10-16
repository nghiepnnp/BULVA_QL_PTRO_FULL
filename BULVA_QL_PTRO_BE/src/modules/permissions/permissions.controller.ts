import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { JwtPassportAuthGuard } from '#/common/guards/jwt-passport-auth.guard';
import { PermissionsService } from './permissions.service.js';

@ApiTags('Permissions')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'JWT is missing or invalid' })
@UseGuards(JwtPassportAuthGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @ApiOperation({ summary: 'List all active permissions' })
  @ApiOkResponse({ description: 'Active permissions' })
  findAllActive() {
    return this.permissionsService.findAllActive();
  }
}
