import { GameServer, GameServerOptions } from './game-server';
import { Rcon } from 'rcon-client';

export class MinecraftServer extends GameServer {
  private rcon: Rcon;

  constructor(opts: GameServerOptions) {
    super(opts);

    // Initialize the RCON connection
    this.rcon = new Rcon({
      host: 'localhost', // The IP address of your Minecraft server (modify as needed)
      port: 25575, // The default RCON port for Minecraft (modify if you've changed it)
      password: process.env.MINECRAFT_RCON_PASSWORD!, // Set your RCON password here
    });
  }

  public async executeCommand(cmd: string) {
    await this.rcon.connect();

    const response = await this.rcon.send(cmd);

    await this.rcon.end();

    return response;
  }
}
