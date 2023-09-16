import { exec } from 'child_process';
import { GameServer, GameServerOptions } from './game-server';

export class MinecraftServer extends GameServer {
  constructor(opts: GameServerOptions) {
    super(opts);
  }

  public executeCommand(cmd: string) {
    exec(`docker exec ${this.controller.containerName} rcon-cli ${cmd}`);
  }
}
