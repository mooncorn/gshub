import { Request, Response, NextFunction } from 'express';
import { decode } from 'next-auth/jwt';

export type UserRole = 'USER' | 'ADMIN';

export interface UserPayload {
  id: string;
  username: string;
  email: string;
  role: UserRole;
}

// Augment an existing interface
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role: UserRole;
  }
}

export const currentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const cookieName =
    process.env.NODE_ENV === 'production'
      ? '__Secure-next-auth.session-token'
      : 'next-auth.session-token';

  const nextAuthSessionToken = req.cookies[cookieName] as string | undefined;

  if (nextAuthSessionToken) {
    try {
      // Decode and validate the JWT claims set
      const decoded = await decode({
        token: nextAuthSessionToken,
        secret: process.env.NEXTAUTH_SECRET!,
      });

      if (decoded) {
        const user: UserPayload = {
          id: decoded.id as string,
          username: decoded.name as string,
          email: decoded.email as string,
          role: decoded.role as UserRole,
        };
        req.user = user;
      }
    } catch (error) {}
  }

  next();
};
