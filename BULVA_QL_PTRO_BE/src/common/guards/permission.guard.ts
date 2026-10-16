import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '#/common/decorator/require-permission.decorator';
import type { AuthenticatedRequest } from '../enums/auth.type.js';
import { PermissionsService } from '#/modules/permissions/permissions.service';
import { EnvService } from '../../config/env/env.service.js';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionService: PermissionsService,
    private readonly env: EnvService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permission = this.reflector.getAllAndOverride<string>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Endpoint không yêu cầu permission
    if (!permission) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = request.user?.id;

    if (!userId) {
      throw new UnauthorizedException('Unauthenticated');
    }

    const hasPermission = await this.permissionService.hasPermission(
      userId,
      permission,
    );

    if (!hasPermission) {
      if (this.env.isDevelopment) {
        throw new ForbiddenException(`Missing permission: ${permission}`);
      }
      throw new ForbiddenException(`Missing permission.`);
    }

    return true;
  }
}
