import { CustomError } from "./custom-error";
import { SerializedError } from "./interfaces/serialized-error";

export class ServerOnlineError extends CustomError {
  statusCode: number = 400;

  serializeErrors(): SerializedError[] {
    return [{ message: "Server is online" }];
  }
  constructor(message: string = "Server online") {
    super(message);
    this.name = "Server online";
  }
}
