// import {
//   CanActivate,
//   ExecutionContext,
//   Injectable,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { Request } from 'express';
// import { JwtService } from '@nestjs/jwt';
// import { EnvService } from '#/config/env/env.service';
// import type { AuthenticatedRequest } from '../enums/auth.type.js';

// @Injectable()
// export class JwtAuthGuard implements CanActivate {
//   constructor(
//     private readonly jwtService: JwtService,
//     private readonly envConfig: EnvService,
//   ) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
//     // Extract Token
//     const token = this.extractTokenFromHeader(request);
//     if (!token) {
//       throw new UnauthorizedException();
//     }
//     try {
//       const payload = await this.jwtService.verifyAsync(token, {
//         secret: this.envConfig.jwtSecret,
//       });

//       // console.log('1. Guard payload:', payload);

//       request.user = payload;
//     } catch {
//       throw new UnauthorizedException();
//     }

//     return true;
//   }

//   private extractTokenFromHeader(request: Request): string | undefined {
//     const [type, token] = request.headers.authorization?.split(' ') ?? [];
//     return type === 'Bearer' ? token : undefined;
//   }
// }
