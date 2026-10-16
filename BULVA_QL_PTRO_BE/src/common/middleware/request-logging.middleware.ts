import { Injectable, Logger, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const startedAt = Date.now();
    const { method, originalUrl } = request;

    // this.logger.log(`--> ${method} ${originalUrl}`);

    // Hoàn tất
    response.once('finish', () => {
      const duration = Date.now() - startedAt;

      this.logger.log(
        `${method}: ${originalUrl} ${response.statusCode} ${duration}ms`,
      );
    });

    // Case: Client ngắt kết nối trước khi response hoàn thành
    response.once('close', () => {
      if (!response.writableFinished) {
        const duration = Date.now() - startedAt;

        this.logger.warn(`${method}: ${originalUrl} aborted ${duration}ms`);
      }
    });

    next();
  }
}
