import { NextFunction, Request, Response } from 'express';
import { getFormattedTime } from '../lib/utils';

export const logger = (req: Request, res: Response, next: NextFunction) => {
  console.log(`[${getFormattedTime()}] ${req.method} ${req.path}`);
  next();
};
