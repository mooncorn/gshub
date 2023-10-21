import { GameServer, GameServerOptions } from './game-server';

export class ValheimServer extends GameServer {
  constructor(opts: GameServerOptions) {
    super(opts);

    opts.controller.removeAllListeners('data');
    opts.controller.on('data', (chunk) => {
      const cleanChunk: string = chunk.toString().slice(8, chunk.length);
      this.io.emit(`${this.controller.name}/consoleOutput`, cleanChunk);
    });
  }

  public async getLogs(limit: number): Promise<string | undefined> {
    const logs = await this.controller.getLogs(limit);
    return (
      logs &&
      logs
        .split('\n')
        .map((line) => line.slice(8, line.length))
        .join('\n')
    );
  }
}
