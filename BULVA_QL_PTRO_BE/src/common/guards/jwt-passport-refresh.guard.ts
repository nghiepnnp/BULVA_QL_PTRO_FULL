import { Injectable,  ExecutionContext,
 UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtPassportRefreshGuard extends AuthGuard('jwt-refresh') {
  constructor() {
    super();
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // You can throw an exception based on either "info" or "err" arguments

    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException(
          'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!',
        )
      );
    }

    console.log('🚀🚀🚀 Refresh Token');

    return user;
  }
}
