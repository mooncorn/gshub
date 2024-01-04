import { SerializedError } from "./interfaces/serialized-error";
import { CustomError } from "./custom-error";

export class NotFoundError extends CustomError {
  statusCode = 404;

  constructor(public message = "Route not found") {
    super("Route not found");
  }

  serializeErrors(): SerializedError[] {
    return [{ message: "Route not found" }];
  }
}
