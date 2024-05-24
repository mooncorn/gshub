import { Request, Response, NextFunction } from "express";
import { UnauthorizedRequestError } from "../lib/exceptions/unauthorized-request-error";

// requireAdmin assumes the request has already
// been processed by currentUser and requireAuth middleware
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== "ADMIN") {
    throw new UnauthorizedRequestError();
  }

  next();
};
