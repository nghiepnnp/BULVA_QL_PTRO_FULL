import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';
import type { Request, Response } from 'express';

interface HttpErrorResponse {
  code?: string;
  error?: string;
  message?: string | string[];
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestPath = this.sanitizePath(request.originalUrl ?? request.url);

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_SERVER_ERROR';

    // Exception do NestJS chủ động throw
    if (exception instanceof HttpException) {
      status = exception.getStatus();

      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const data = exceptionResponse as HttpErrorResponse;

        message = Array.isArray(data.message)
          ? data.message.join(', ')
          : (data.message ?? message);
        code =
          data.code ?? this.toErrorCode(data.error) ?? this.statusCode(status);
      }

      if (code === 'INTERNAL_SERVER_ERROR') {
        code = this.statusCode(status);
      }
    }

    // Exception từ TypeORM / PostgreSQL
    else if (exception instanceof QueryFailedError) {
      const driverError = exception.driverError as {
        code?: string;
        detail?: string;
        constraint?: string;
      };
      // status = HttpStatus.BAD_REQUEST;
      // code = 'BAD_REQUEST';
      // message = 'Dữ liệu đã tồn tại';

      switch (driverError.code) {
        // unique_violation
        case '23505':
          status = HttpStatus.CONFLICT;
          code = 'DUPLICATE_RESOURCE';
          message = 'Dữ liệu đã tồn tại';
          break;

        // foreign_key_violation
        case '23503':
          status = HttpStatus.CONFLICT;
          code = 'FOREIGN_KEY_VIOLATION';
          message = 'Dữ liệu đang tham chiếu không hợp lệ';
          break;

        // not_null_violation
        case '23502':
          status = HttpStatus.BAD_REQUEST;
          code = 'NOT_NULL_VIOLATION';
          message = 'Thiếu dữ liệu bắt buộc';
          break;

        // invalid_text_representation
        case '22P02':
          status = HttpStatus.BAD_REQUEST;
          code = 'INVALID_DATA';
          message = 'Dữ liệu không đúng định dạng';
          break;

        default:
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          code = 'DATABASE_ERROR';
          message = 'Database error';
      }
    } else if (exception instanceof EntityNotFoundError) {
      status = HttpStatus.BAD_REQUEST;
      code = 'BAD_REQUEST';
      message = 'EntityNotFoundError';
    }

    const logContext = {
      method: request.method,
      path: requestPath,
      statusCode: status,
      code,
      message,
      exception:
        exception instanceof Error
          ? {
              name: exception.name,
              message: exception.message,
            }
          : exception,
    };

    if (status >= 500) {
      this.logger.error(
        logContext,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(logContext);
    }

    if (response.headersSent) {
      return;
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      code,
      message,
      path: requestPath,
      timestamp: new Date().toISOString(),
    });
  }

  private statusCode(status: number): string {
    const statusName = HttpStatus[status];
    return typeof statusName === 'string' ? statusName : 'HTTP_ERROR';
  }

  private toErrorCode(error: string | undefined): string | undefined {
    return error
      ?.replace(/([a-z0-9])([A-Z])/g, '$1_$2')
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .toUpperCase();
  }

  private sanitizePath(path: string): string {
    try {
      const url = new URL(path, 'http://localhost');

      for (const key of url.searchParams.keys()) {
        if (/password|token|secret|code|otp|hash|^h$/i.test(key)) {
          url.searchParams.set(key, '[REDACTED]');
        }
      }

      return `${url.pathname}${url.search}`;
    } catch {
      return path;
    }
  }
}
