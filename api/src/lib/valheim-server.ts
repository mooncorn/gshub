import { Server } from 'socket.io';
import Docker, { Container } from 'dockerode';
import { GameServerStatus } from './game-server';
import { ServerOfflineError } from './exceptions/server-offline-error';
import { InternalError } from './exceptions/internal-error';
import { Writable } from 'stream';
import { BadRequestError } from './exceptions/bad-request-error';

const docker = new Docker();

export class ValheimServer {
  private _io: Server;
  private _container: Container | undefined;
  public status: GameServerStatus;

  constructor(io: Server) {
    this._io = io;
    this.status = GameServerStatus.OFFLINE;

    this.init();
  }

  private stdoutStream = new Writable({
    write: (chunk, _, callback) => {
      this._io.emit('valheim/consoleOutput', chunk.toString()); // Emitting the output as an event for STDOUT
      callback();
    },
  });

  private async init() {
    const containers = await docker.listContainers({
      all: true,
    });
    const valheimContainer = containers.find((container) =>
      container.Names.includes('/valheim-server')
    );

    if (!valheimContainer)
      throw new InternalError('Could not find valheim server container');

    this._container = docker.getContainer(valheimContainer.Id);

    this._container.attach(
      {
        stream: true,
        stdin: true,
        stdout: true,
        stderr: true,
      },
      (_, stream) => {
        this._container?.modem.demuxStream(
          stream,
          this.stdoutStream,
          this.stdoutStream
        );
      }
    );

    this.setStatus(await this.getStatus());
  }

  public async start() {
    if (!this._container)
      throw new InternalError('Valheim server container was not initialized');

    if (this.status === GameServerStatus.ONLINE)
      throw new BadRequestError('Server is already online');

    try {
      await this._container.start();
      this.setStatus(GameServerStatus.ONLINE);
    } catch (err) {
      console.log('Failed to start server: ', err);
      throw new BadRequestError('Failed to start server');
    }
  }

  public async stop() {
    if (!this._container)
      throw new InternalError('Valheim server container was not initialized');

    if (this.status === GameServerStatus.OFFLINE)
      throw new BadRequestError('Server is already offline');

    try {
      await this._container.stop();
      this.setStatus(GameServerStatus.OFFLINE);
    } catch (err) {
      console.log('Failed to stop server: ', err);
      throw new BadRequestError('Failed to stop server');
    }
  }

  public async restart(): Promise<void> {
    try {
      await this.stop();
    } catch (err) {
      if (!(err instanceof BadRequestError)) throw err;
    }
    await this.start();
  }

  public async getLogs(limit?: number) {
    if (!this._container) throw new ServerOfflineError();

    const buffer = await this._container.logs({
      follow: false, // Don't keep the connection open
      stdout: true,
      stderr: true,
      tail: limit,
    });

    return buffer
      .toString('utf-8')
      .split('\n')
      .map((line) => line.slice(8, line.length))
      .join('\n');
  }

  public async getStatus() {
    const logs = await this.getLogs();

    const startIndex = logs.lastIndexOf('Game server connected');
    const stopIndex = logs.lastIndexOf('valheim-server (exit status 0)');

    return startIndex > stopIndex
      ? GameServerStatus.ONLINE
      : GameServerStatus.OFFLINE;
  }

  public setStatus(status: GameServerStatus) {
    this.status = status;
    this._io.emit('valheim/statusChanged', status);
  }
}
