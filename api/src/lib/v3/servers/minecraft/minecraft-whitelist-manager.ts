import { MinecraftServer } from "./minecraft-server";

export class MinecraftWhitelistManager {
  constructor(private server: MinecraftServer) {}

  public async list() {}

  public async add(player: string) {}

  public async remove(player: string) {}

  public async isActivated() {}

  public async setActive(activate: boolean) {}
}
