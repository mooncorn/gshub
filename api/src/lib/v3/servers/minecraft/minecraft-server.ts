import { IContainer } from "../../docker/docker-container";
import { Server } from "../server";

export class MinecraftServer extends Server {
  public readonly type: string;
  public readonly version: string;

  constructor(container: IContainer) {
    super(container);
    this.type = container.env.TYPE;
    this.version = container.env.VERSION;
  }
}
