import { NextFunction, Request, Response } from 'express';
import { CustomError } from '../lib/exceptions/custom-error';
import { getFormattedTime } from '../lib/utils';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof CustomError) {
    console.error(
      `[${getFormattedTime()}] Error: ${err.serializeErrors().at(0)?.message}`
    );

    return res.status(err.statusCode).json({ errors: err.serializeErrors() });
  }

  console.error(`[${getFormattedTime()}] Internal Error: ${err}`);
  res.status(500).json({ errors: [{ message: 'Something went wrong' }] });
};
