import { CustomError } from './custom-error';
import { SerializedError } from './interfaces/serialized-error';

export class ServerOfflineError extends CustomError {
  statusCode: number = 400;

  serializeErrors(): SerializedError[] {
    return [{ message: 'Server is offline' }];
  }

  constructor(message: string = 'Server offline') {
    super(message);
    this.name = 'Server offline';
  }
}
