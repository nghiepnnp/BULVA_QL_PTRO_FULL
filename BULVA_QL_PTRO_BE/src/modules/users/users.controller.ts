import {
  Controller,
  Body,
  Post,
  Get,
  ParseUUIDPipe,
  Param,
  Patch,
  Query,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { PagedQueryDto } from '#/common/specifications/paged-query.dto';
import { UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RequirePermission } from '#/common/decorator/require-permission.decorator';
import { PERMISSIONS } from '#/define-permission';
import { PermissionGuard } from '../../common/guards/permission.guard.js';
import { PublicEndpoint } from '../../common/decorator/non-auth.decorator.js';
import { JwtPassportAuthGuard } from '../../common/guards/jwt-passport-auth.guard.js';
import { CreateUserDto } from './dto/create-user.dto.js';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'JWT is missing or invalid' })
@UseGuards(JwtPassportAuthGuard)
@Controller()
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post('users')
  @ApiOperation({ summary: 'Create a user' })
  @ApiCreatedResponse({ description: 'User created successfully' })
  async create(@Body() dto: CreateUserDto) {
    return await this.userService.create(dto);
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'User ID' })
  @ApiOkResponse({ description: 'User updated successfully' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return await this.userService.update(id, dto);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'User ID' })
  @ApiOkResponse({ description: 'User found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.findOne(id);
  }

  @Post('users/list')
  @ApiOperation({ summary: 'Search and paginate users' })
  @ApiOkResponse({ description: 'Paginated users' })
  @UseGuards(PermissionGuard)
  @RequirePermission(PERMISSIONS.USERS.SEARCH)
  listAll(@Body() query: PagedQueryDto) {
    return this.userService.list(query);
  }

  @Delete('users/:id')
  @UseGuards(PermissionGuard)
  @ApiOperation({ summary: 'Delete users' })
  @ApiNoContentResponse({ description: 'Delete users' })
  @RequirePermission(PERMISSIONS.USERS.DELETE)
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.delete(id);
  }

  @PublicEndpoint()
  @Get('active-user/:id')
  async activeUser(@Param('id') id: string, @Query('email') _email: string) {
    // try {
    await this.userService.updateUserActive(id);
    return 'Email verified';
    // } catch {
    //   return 'Lỗi hệ thống, vui lòng thử lại sau!';
    // }
  }
}
