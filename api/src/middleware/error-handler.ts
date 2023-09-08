import { NextFunction, Request, Response } from 'express';
import { CustomError } from '../lib/exceptions/custom-error';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({ errors: err.serializeErrors() });
  }

  console.error(err);
  res.status(500).json({ errors: [{ message: 'Something went wrong' }] });
};
