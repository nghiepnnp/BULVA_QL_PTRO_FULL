import dayjs from 'dayjs';
import bcrypt from 'bcrypt';
import {
  LoginType,
  OtpChallengePurpose,
  UserStatus,
} from '../../common/enums/enum.js';
import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import { JwtService } from '@nestjs/jwt';
import { comparePassword } from '#/common/utils/bcrypt.utils';
import { EnvService } from '#/config/env/env.service';
import { CreateUserDto } from '../users/dto/create-user.dto.js';
import { OtpChallenge } from '../../domain/otp-challenge.entity.js';
import { Repository } from 'typeorm/browser/repository/Repository.js';
import { InjectRepository } from '@nestjs/typeorm';
import { SendMailService } from '../send-mail/send-mail.service.js';
import { Response } from 'express';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(OtpChallenge)
    private readonly otpChallengeRepository: Repository<OtpChallenge>,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: EnvService,
    private readonly sendMailService: SendMailService,
  ) {}

  // Init default cookie options
  private get cookieOptions() {
    return {
      httpOnly: true,
      secure: this.config.isProduction,
      sameSite: 'strict' as const,
    };
  }

  // For Passport Local Strategy
  public async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (!user || !comparePassword(password, user?.password)) {
      return null;
    }
    const { password: _, ...result } = user;

    return result;
  }

  public async login(user: any, response: Response) {
    const result = await this.processAuth(user, response);
    return {
      ...result,
      expiresIn: this.config.jwtExpiresIn,
    };
  }

  public async refreshToken(user: any, response: Response) {
    const result = await this.processAuth(user, response);
    return {
      ...result,
      expiresIn: this.config.jwtExpiresIn,
    };
  }

  private async processAuth(
    user: any,
    response: Response,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(
      { type: 'refresh', ...payload },
      {
        expiresIn: 7 * 24 * 60 * 60, // 7 ngày * 24 giờ * 60 phút * 60 giây * 1000 ms
        secret: this.config.jwtRefreshSecret,
      },
    );

    response.cookie('access_token', accessToken, {
      ...this.cookieOptions,
      maxAge: 10 * 60 * 1000, // 10 phút
      // Giới hạn path '/api/v1/auth/refresh' để brower không gửi kèm token này tới các API khác
      // path: '/api/v1/auth/refresh',
      path: '/',
    });

    response.cookie('refresh_token', refreshToken, {
      ...this.cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
      // Giới hạn path '/api/v1/auth/refresh' để brower không gửi kèm token này tới các API khác
      // path: '/api/v1/auth/refresh',
      path: '/',
    });

    return { accessToken, refreshToken };
  }

  // Logout
  public async logout(response: Response): Promise<void> {
    response.clearCookie('access_token', {
      ...this.cookieOptions,
      path: '/',
    });

    response.clearCookie('refresh_token', {
      ...this.cookieOptions,
      path: '/',
    });
  }

  public async register(user: CreateUserDto) {
    // Check type user:
    switch (user.loginType) {
      case LoginType.INTERNAL:
        // Check trùng user name, email, password khớp không, nếu trùng thì throw lỗi
        if (await this.usersService.checkExistsEmail(user.email)) {
          throw new ConflictException('Email đã tồn tại');
        }

        if (await this.usersService.checkExistUsername(user.username)) {
          throw new ConflictException('Username đã tồn tại');
        }

        // Tạo user mới
        const newUser = await this.usersService.create(user);

        // Send email xác nhận tài khoản

        await this.sendMailActive(newUser.id, newUser.username, newUser.email);

        return newUser;

      case LoginType.GOOGLE:
        // Handle Google login registration logic here
        break;
    }
  }

  public async verifyOtp(challengeId: string, target: string, code: string) {
    // try {
    // switch (challenge) {
    //   case OtpChallengePurpose.EMAIL_VERIFY:

    let attemptCount = 0;
    let consumedAt = dayjs().toDate();
    let flagSuccess = true;

    const challenge = await this.otpChallengeRepository.findOneByOrFail({
      id: challengeId,
      target,
    });

    attemptCount = Number(challenge.attemptCount) + 1;

    if (!challenge || !bcrypt.compareSync(code, challenge.codeHash)) {
      this.logger.warn({ message: 'OTP verification failed', challengeId });

      flagSuccess = false;
    }

    // Update challenge otp
    this.otpChallengeRepository.merge(challenge, {
      attemptCount: attemptCount,
      consumedAt: consumedAt,
    });

    await this.otpChallengeRepository.save(challenge);

    // Update user
    await this.usersService.updateStatusEmailVerify(target);

    if (flagSuccess) {
      this.logger.log({ message: 'OTP verified', challengeId });
    }

    return flagSuccess;
    //     break;
    // }

    // Send OTP to email
    // } catch (ex) {
    //   throw new InternalServerErrorException('Lỗi hệ thống, vui lòng thử lại');
    // }
  }

  private async sendMailActive(
    userId: string,
    username: string,
    email: string,
  ) {
    this.logger.log('Activation email is being sent');

    const activeUrl = `http://localhost:3000/api/v1/active-user/${userId}?email=${email}&h=skfjdslk`;
    await this.sendMailService.activeAccount(username, activeUrl);

    this.logger.log('Activation email sent');

    // Send OTP to email
  }

  private async sendOtp(
    challenge: OtpChallengePurpose,
    userId: string,
    target: string,
  ) {
    switch (challenge) {
      case OtpChallengePurpose.EMAIL_VERIFY:
        // Check if the target email is already verified
        const existingUser = await this.usersService.findByEmail(target);
        if (existingUser && existingUser.emailVerified) {
          throw new ConflictException('Email đã được xác minh');
        }

        // Hash string OTP code and save to database
        const otp = this.generateOTP();
        const hashedOtp = bcrypt.hashSync(otp, 10);

        const otpChallenge = this.otpChallengeRepository.create({
          userId: userId,
          target: target,
          purpose: challenge,
          codeHash: hashedOtp,
          expiresAt: dayjs().add(5, 'minute').toDate(),
        });

        await this.otpChallengeRepository.save(otpChallenge);

        this.logger.log('OTP email is being sent');
        // Send email with OTP code
        await this.sendMailService.send(target, existingUser.username, otp);

        this.logger.log('OTP email sent');

        break;
    }

    // Send OTP to email
  }

  private generateOTP(): string {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp.toString();
  }
}
