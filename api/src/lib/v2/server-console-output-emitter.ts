import { IDockerContainer } from "./docker-container";
import { IEventEmitter } from "./io-event-emitter";

export interface IServerConsoleOutputEmitter {}

export class ServerConsoleOutputEmitter implements IServerConsoleOutputEmitter {
  constructor(
    private emitter: IEventEmitter,
    private container: IDockerContainer
  ) {
    this.container.on("consoleOutput", (data) =>
      this.emitter.emit(`${this.container.name}/consoleOutput`, data)
    );
  }
}
