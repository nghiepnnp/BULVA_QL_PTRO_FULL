import type { Request } from 'express';

export interface AuthenticatedUser {
  id: string;
  username: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}
