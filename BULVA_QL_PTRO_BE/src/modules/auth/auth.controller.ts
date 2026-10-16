import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Query,
  Res,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import type { Request as eRequest, Response } from 'express';
import type { RequestAuthenticated } from './dto/request.js';
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { PermissionGuard } from '../../common/guards/permission.guard.js';
import { RequirePermission } from '#/common/decorator/require-permission.decorator';
import { PERMISSIONS } from '#/define-permission';
import { LocalPassportAuthGuard } from '#/common/guards/local-passport-auth.guard';
import { JwtPassportAuthGuard } from '#/common/guards//jwt-passport-auth.guard';
import { PublicEndpoint } from '../../common/decorator/non-auth.decorator.js';
import { UsersService } from '../users/users.service.js';
import { JwtPassportRefreshGuard } from '../../common/guards/jwt-passport-refresh.guard.js';
import { CreateUserDto } from '../users/dto/create-user.dto.js';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @Post('login')
  @PublicEndpoint()
  @UseGuards(LocalPassportAuthGuard)
  async login(
    @Request() request: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(request.user, response);
    return result;
  }

  @Post('refresh')
  @PublicEndpoint()
  @UseGuards(JwtPassportRefreshGuard)
  async refresh(
    @Request() request: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    // Call dùng rt để auth, thành công thì call hàm login bình thường
    const result = await this.authService.refreshToken(request.user, response);
    return result;
  }

  @Post('logout')
  @PublicEndpoint()
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Request() req: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    console.log('user info logout: ', req);

    this.authService.logout(response);
  }

  @Post('register')
  @PublicEndpoint()
  @ApiOkResponse({ description: 'Current authenticated user payload' })
  @ApiBody({ type: CreateUserDto })
  async register(@Body() newUser: CreateUserDto) {
    return await this.authService.register(newUser);
  }

  @PublicEndpoint()
  @Get('verify-otp')
  async verifyOtp(
    @Query('challengeId') challengeId: string,
    @Query('target') target: string,
    @Query('code') code: string,
  ) {
    return this.authService.verifyOtp(challengeId, target, code);
  }

  @Get('profile')
  @UseGuards(JwtPassportAuthGuard, PermissionGuard)
  @RequirePermission(PERMISSIONS.AUTH.PPOFILE)
  async getProfile(@Request() req: RequestAuthenticated) {
    return await this.userService.findOne(req.user.id);
  }
}
