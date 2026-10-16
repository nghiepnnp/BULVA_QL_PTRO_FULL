import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service.js';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserStatus } from '../../../common/enums/enum.js';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email', // Truyền custom field vào, mặc định nhận username thay vì email
    });
  }

  // async validate(email: string, password: string) {
  //   const user = await this.authService.signIn(email, password);

  //   if (!user) {
  //     throw new UnauthorizedException();
  //   }

  //   return user;
  // }

  async validate(email: string, password: string) {
    const user = await this.authService.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException();
    }

    switch (user.status) {
      case UserStatus.ACTIVE:
        return user;
      case UserStatus.PENDING:
        throw new UnauthorizedException('User is inactive');
      case UserStatus.LOCKED:
        throw new UnauthorizedException('User is banned');
    }
  }
}
