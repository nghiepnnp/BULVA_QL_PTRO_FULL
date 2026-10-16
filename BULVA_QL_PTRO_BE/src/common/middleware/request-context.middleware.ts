import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { CurrentUserContext } from '#/common/context/current-user.context';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  constructor(private readonly currentUser: CurrentUserContext) {}

  use(_req: Request, _res: Response, next: NextFunction) {
    this.currentUser.run(() => {
      next();
    });
  }
}