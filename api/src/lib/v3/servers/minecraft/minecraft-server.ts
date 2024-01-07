import { IContainer } from "../../docker/docker-container";
import { Server } from "../server";
import { MinecraftWhitelistManager } from "./minecraft-whitelist-manager";
import { MinecraftWorldManager } from "./minecraft-world-manager";

export class MinecraftServer extends Server {
  public readonly worlds: MinecraftWorldManager;
  public readonly whitelist: MinecraftWhitelistManager;

  constructor(protected container: IContainer) {
    super(container);
    this.worlds = new MinecraftWorldManager(this);
    this.whitelist = new MinecraftWhitelistManager(this);
  }
}
