import { APP_INTERCEPTOR } from '@nestjs/core';
import { CurrentUserContext } from '#/common/context/current-user.context';
import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CurrentUserInterceptor } from '#/common/interceptors/current-user.interceptor';
import { RequestContextMiddleware } from '#/common/middleware/request-context.middleware';
import { RequestLoggingMiddleware } from '#/common/middleware/request-logging.middleware';

@Global()
@Module({
  providers: [
    CurrentUserContext,
    {
      provide: APP_INTERCEPTOR,
      useClass: CurrentUserInterceptor,
    },
  ],
  exports: [CurrentUserContext],
})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLoggingMiddleware, RequestContextMiddleware)
      .forRoutes('*');
  }
}
