import { ContainerInfo } from "./docker/docker-container";

export interface IMinecraftServer {}

export class MinecraftServer implements IMinecraftServer {
  constructor(private readonly info: ContainerInfo) {
    this.info = info;
  }
}
