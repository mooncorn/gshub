import { Request, Response, NextFunction } from 'express';
import { UnauthorizedRequestError } from '../lib/exceptions/unauthorized-request-error';
import { getFormattedTime } from '../lib/utils';

// requireAuth assumes the request has already
// been processed by currentUser middleware
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    throw new UnauthorizedRequestError();
  }

  const user = req.user!;

  console.log(
    `[${getFormattedTime()}] Authenticated: ${user.id} ${user.role} ${
      user.email
    }`
  );
  next();
};
