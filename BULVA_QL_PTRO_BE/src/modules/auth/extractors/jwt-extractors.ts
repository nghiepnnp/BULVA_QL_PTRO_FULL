import { Request } from 'express';

export const fromRefreshTokenCookie = (req: Request): string | null => {
  if (req && req.cookies) {
    return req.cookies['refresh_token'] || null;
  }
  return null;
};