import { Request, Response, NextFunction } from "express";
import { UnauthorizedRequestError } from "../lib/exceptions/unauthorized-request-error";

// requireAuth assumes the request has already
// been processed by currentUser middleware
export const requireAuth = (req: Request, _: Response, next: NextFunction) => {
  if (process.env.TS_NODE_DEV === "true") {
    next();
    return;
  }

  if (!req.user) {
    throw new UnauthorizedRequestError();
  }
  next();
};
