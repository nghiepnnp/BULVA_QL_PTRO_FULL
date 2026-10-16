import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ENV } from './env.constant.js';
import type { EnvironmentVariables } from './env.constant.js';

@Injectable()
export class EnvService {
  constructor(private readonly config: ConfigService<EnvironmentVariables>) {}

  // #region Application Configuration
  get nodeEnv(): string {
    return this.config.getOrThrow<string>(ENV.NODE_ENV);
  }

  get port(): number {
    return this.config.getOrThrow<number>(ENV.PORT);
  }
  // #endregion Application Configuration

  // #region Database Configuration
  get dbHost(): string {
    return this.config.getOrThrow<string>(ENV.DB_HOST);
  }

  get dbPort(): number {
    return this.config.getOrThrow<number>(ENV.DB_PORT);
  }

  get dbUsername(): string {
    return this.config.getOrThrow<string>(ENV.DB_USERNAME);
  }

  get dbPassword(): string {
    return this.config.getOrThrow<string>(ENV.DB_PASSWORD);
  }

  get dbDatabase(): string {
    return this.config.getOrThrow<string>(ENV.DB_DATABASE);
  }

  get jwtSecret(): string {
    return this.config.getOrThrow<string>(ENV.JWT_SECRET);
  }

  get jwtRefreshSecret(): string {
    return this.config.getOrThrow<string>(ENV.JWT_REFRESH_SECRET);
  }

  get jwtExpiresIn(): number {
    return this.config.getOrThrow<number>(ENV.JWT_EXPIRES_IN);
  }
  // #endregion Database Configuration

  // #region SMTP Configurations
  get smtpHost(): string {
    return this.config.getOrThrow<string>(ENV.SMTP_HOST);
  }

  get smtpPort(): number {
    return this.config.getOrThrow<number>(ENV.SMTP_PORT);
  }

  get smtpUser(): string {
    return this.config.getOrThrow<string>(ENV.SMTP_USER);
  }

  get smtpPass(): string {
    return this.config.getOrThrow<string>(ENV.SMTP_PASS);
  }
  // #endregion SMTP Configurations

  // Additional getters for other environment variables can be added here
  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }
}
