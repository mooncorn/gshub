import { IDocker } from "../../docker/docker-service";
import { ServerManager } from "../server-manager";
import { ValheimServer } from "./valheim-server";

export interface CreateValheimServerOpts {
  name: string;
}

export class ValheimServerManager extends ServerManager<ValheimServer> {
  constructor(docker: IDocker, image: string) {
    const servers = docker
      .list()
      .filter((c) => c.image === image)
      .map((c) => new ValheimServer(c));
    super(docker, image, servers);
  }

  public create(opts: CreateValheimServerOpts): Promise<ValheimServer> {
    throw new Error("Method not implemented.");
  }

  public delete(id: string): Promise<ValheimServer> {
    throw new Error("Method not implemented.");
  }
}
