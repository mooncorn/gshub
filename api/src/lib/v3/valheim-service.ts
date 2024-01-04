import { IContainer } from "./docker/docker-container";
import { IServerManager } from "./minecraft-service";
import { IValheimServer } from "./valheim-server";

export interface UpdateValheimServerOpts {}

export interface CreateValheimServerOpts extends UpdateValheimServerOpts {
  name: string;
}

export class ValheimService
  implements
    IServerManager<
      IValheimServer,
      CreateValheimServerOpts,
      UpdateValheimServerOpts
    >
{
  start(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  stop(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  restart(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  create(opts: CreateValheimServerOpts): Promise<IValheimServer> {
    throw new Error("Method not implemented.");
  }
  update(id: string, opts: UpdateValheimServerOpts): Promise<IValheimServer> {
    throw new Error("Method not implemented.");
  }
  delete(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  get(id: string): IValheimServer | undefined {
    throw new Error("Method not implemented.");
  }
  list(): { server: IValheimServer; container: IContainer }[] {
    throw new Error("Method not implemented.");
  }
}
