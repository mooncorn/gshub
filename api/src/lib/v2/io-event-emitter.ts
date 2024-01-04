import { Server } from "socket.io";

export interface IEventEmitter {
  emit(event: string, ...args: any[]): boolean;
}

export class IOEventEmitter implements IEventEmitter {
  constructor(private io: Server) {}

  public emit(event: string, ...args: any[]): boolean {
    return this.io.emit(event, ...args);
  }
}
