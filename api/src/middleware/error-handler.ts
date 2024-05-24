import { NextFunction, Request, Response } from "express";
import { getFormattedTime } from "../lib/utils";
import { CustomError } from "../lib/exceptions/custom-error";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({ errors: err.serializeErrors() });
  }
  console.log(err);
  res.status(500).json({ errors: [{ message: "Something went wrong" }] });
};
