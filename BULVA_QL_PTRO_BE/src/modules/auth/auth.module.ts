import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { UsersModule } from '../users/users.module.js';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller.js';
import { EnvService } from '#/config/env/env.service';
import { PermissionsModule } from '../permissions/permissions.module.js';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './passport/local.strategy.js';
import { JwtStrategy } from './passport/jwt.strategy.js';
import { OtpChallenge } from '../../domain/otp-challenge.entity.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SendMailModule } from '../send-mail/send-mail.module.js';
import { JwtRefreshStrategy } from './passport/jwt-refresh.strategy.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([OtpChallenge]),
    JwtModule.registerAsync({
      global: true,
      inject: [EnvService],
      useFactory: async (envConfig: EnvService) => ({
        secret: envConfig.jwtSecret,
        signOptions: { expiresIn: envConfig.jwtExpiresIn },
      }),
    }),
    PassportModule.register({
      defaultStrategy: 'local',
    }),
    UsersModule,
    PermissionsModule,
    SendMailModule,
  ],
  controllers: [AuthController],
  providers: [
    // EnvService,
    AuthService,
    LocalStrategy, // Login email/pass
    JwtStrategy, // access token
    JwtRefreshStrategy // refresh token
  ],
  exports: [AuthService],
})
export class AuthModule {}
