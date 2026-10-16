import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { EnvService } from '#/config/env/env.service';
import { fromRefreshTokenCookie } from '../extractors/jwt-extractors.js'

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy
  ,
  'jwt-refresh',
) {
  constructor(private readonly config: EnvService) {
    super({
      jwtFromRequest: fromRefreshTokenCookie,
      ignoreExpiration: false,
      secretOrKey: config.jwtRefreshSecret,
    });
  }

  // Result sẽ trả ra và gắn vào @Request
  async validate(payload: any) {
    return {
      id: payload.sub,
      email: payload.email,
      username: payload.username,
    };
  }
}
