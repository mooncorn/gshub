import { CustomError } from "./custom-error";
import { SerializedError } from "./interfaces/serialized-error";

export class InternalError extends CustomError {
  statusCode = 500;

  constructor(message?: string) {
    super(message);
  }

  serializeErrors(): SerializedError[] {
    return [{ message: this.message || "Internal error" }];
  }
}
