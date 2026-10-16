import { ConfigModule } from '@nestjs/config';
import { EnvService } from './env.service.js';
import { Global, Module } from '@nestjs/common';
import { envValidationSchema } from './env.validation.js';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      validationSchema: envValidationSchema,
    }),
  ],
  providers: [EnvService],
  exports: [EnvService],
})
export class EnvModule {}
