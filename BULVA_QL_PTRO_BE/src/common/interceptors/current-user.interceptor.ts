import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import type { AuthenticatedRequest } from '../enums/auth.type.js';
import { CurrentUserContext } from '#/common/context/current-user.context';

@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {
  constructor(private readonly currentUser: CurrentUserContext) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    // console.log('2. Interceptor request.user:', request.user);

    this.currentUser.setUserId(request.user?.id ?? null);

    // console.log('3. Context userId:', this.currentUser.userId);

    return next.handle();
  }
}
