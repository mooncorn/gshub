import path from 'path';
import fs from 'fs/promises';
import { Server } from 'socket.io';
import { ServerOfflineError } from './exceptions/server-offline-error';
import { GameServer } from './game-server';

const MINECRAFT_CONSOLE_LOGS_PATH = path.join(
  process.cwd(),
  '../gameservers/minecraft/logs/latest.log'
);

export class MinecraftServer extends GameServer {
  constructor(io: Server) {
    super({
      io,
      gameName: 'minecraft',
      startCommand: 'java -Xmx1024M -Xms1024M -jar server.jar nogui',
    });
  }

  protected initiateGracefulShutdown(): void {
    this.server?.stdin?.write('stop\n'); // Send the "stop" command
  }

  public execute(cmd: string): void {
    if (!this.server) throw new ServerOfflineError();

    this.opts.io?.emit(this.OUTPUT_EVENT, `Executing command: ${cmd}\n`);
    this.server.stdin?.write(`${cmd}\n`);
  }

  public async getLogs(): Promise<string | undefined> {
    try {
      return await fs.readFile(MINECRAFT_CONSOLE_LOGS_PATH, 'utf-8');
    } catch (err) {
      console.log(err);
      return undefined;
    }
  }
}
