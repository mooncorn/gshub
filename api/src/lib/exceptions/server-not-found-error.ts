import { SerializedError } from "./interfaces/serialized-error";
import { CustomError } from "./custom-error";

export class ServerNotFoundError extends CustomError {
  statusCode = 400;

  constructor(public id: string) {
    super(`Server not found: ${id}`);
  }

  serializeErrors(): SerializedError[] {
    return [{ message: `Server not found: ${this.id}` }];
  }
}
