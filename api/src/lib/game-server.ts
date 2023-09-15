import { Server } from 'socket.io';
import { ContainerController } from './container-controller';

export interface GameServerOptions {
  controller: ContainerController;
  io: Server;
  gameName: string;
}

export class GameServer {
  public readonly controller: ContainerController;
  protected io: Server;
  protected readonly gameName: string;

  constructor(opts: GameServerOptions) {
    this.controller = opts.controller;
    this.io = opts.io;
    this.gameName = opts.gameName;

    this.controller.on('data', (data) =>
      this.io.emit(`${this.gameName}/consoleOutput`, data)
    );
    this.controller.on('status', (status) =>
      this.io.emit(`${this.gameName}/statusChanged`, status)
    );
  }

  public init = async () => await this.controller.init();

  public get status() {
    return this.controller.status;
  }

  public async start() {
    await this.controller.start();
  }

  public async stop() {
    await this.controller.stop();
  }

  public async restart() {
    await this.controller.restart();
  }

  public async getLogs(limit: number) {
    return await this.controller.getLogs(limit);
  }
}
