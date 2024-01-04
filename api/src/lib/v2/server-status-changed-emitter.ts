import { IDockerContainer } from "./docker-container";
import { IEventEmitter } from "./io-event-emitter";

export interface IServerStatusChangedEmitter {}

export class ServerStatusChangedEmitter implements IServerStatusChangedEmitter {
  constructor(
    private emitter: IEventEmitter,
    private container: IDockerContainer
  ) {
    this.container.on("statusChanged", (status) =>
      this.emitter.emit(`${this.container.name}/statusChanged`, status)
    );
  }
}
