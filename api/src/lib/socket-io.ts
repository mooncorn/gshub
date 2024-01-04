import { Server } from "socket.io";
import { IEventEmitter } from "./v3/event-emitter";

export class SocketIO implements IEventEmitter {
  constructor(private io: Server) {}

  public emit(event: string, ...args: any[]): void {
    this.io.emit(event, ...args);
  }

  public on(event: string, listener: (...args: any[]) => void): void {
    this.io.on(event, listener);
  }

  public off(event: string, listener: (...args: any[]) => void): void {
    this.io.off(event, listener);
  }
}
