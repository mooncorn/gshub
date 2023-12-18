import { Server } from 'socket.io';
import { DockerContainer } from './docker-container';
import path from 'path';
import { Identifiable, Nameable } from './name-id-collection';

export interface GameServerOptions {
  container: DockerContainer;
  io: Server;
}

export class GameServer implements Identifiable, Nameable {
  public readonly container: DockerContainer;
  protected io: Server;

  public readonly name: string;
  public readonly id: string;

  public readonly sourceDirectory: string;

  constructor(opts: GameServerOptions) {
    this.container = opts.container;
    this.name = this.container.name;
    this.id = this.container.id;
    this.io = opts.io;

    this.sourceDirectory = path.join(
      process.cwd(),
      '../server-data/minecraft',
      this.container.name
    );

    this.container.on(DockerContainer.CONSOLE_OUTPUT_EVENT, (data) =>
      this.io.emit(
        `${this.container.name}/${DockerContainer.CONSOLE_OUTPUT_EVENT}`,
        data
      )
    );
    this.container.on(DockerContainer.STATUS_CHANGED_EVENT, (status) =>
      this.io.emit(
        `${this.container.name}/${DockerContainer.STATUS_CHANGED_EVENT}`,
        status
      )
    );
  }
}
