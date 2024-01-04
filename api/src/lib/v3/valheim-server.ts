import { ContainerInfo } from "./docker/docker-container";

export interface IValheimServer {}

export class ValheimService implements IValheimServer {
  constructor(private readonly info: ContainerInfo) {
    this.info = info;
  }
}
