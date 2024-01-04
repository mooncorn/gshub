import { NextFunction, Request, Response } from "express";
import { ValidationChain, validationResult } from "express-validator";
import { RequestValidationError } from "../lib/exceptions/request-validation-error";

export const validateRequest = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new RequestValidationError(errors.array());
    }

    next();
  };
};
