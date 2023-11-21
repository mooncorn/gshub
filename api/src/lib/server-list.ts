import { MinecraftServer } from './minecraft-server';

export class ServerList {
  public servers: MinecraftServer[] = [];

  public get(id: string) {
    return this.servers.find((s) => s.controller.id === id);
  }

  public add(server: MinecraftServer) {
    this.servers.push(server);
  }

  public remove(id: string) {
    this.get(id)?.controller.disconnect();
    this.servers = this.servers.filter((s) => s.controller.id !== id);
  }

  public forEach(handler: (server: MinecraftServer) => void) {
    this.servers.forEach(handler);
  }
}
