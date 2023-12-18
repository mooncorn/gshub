import { IDockerContainerManager } from '../docker-container-manager';
import { Server } from '../server';
import { ServerCollection, ServerManager } from '../server-manager';

export type MinecraftServerManagerOptions = {
  containerManager: IDockerContainerManager;
};

export class MinecraftServerManager {
  private readonly image: string = 'itzg/minecraft-server';
  public readonly name: string = 'minecraft';
  private serverManager: ServerManager | undefined;
  private containerManager: IDockerContainerManager;

  constructor(opts: MinecraftServerManagerOptions) {
    this.containerManager = opts.containerManager;
  }

  async init(): Promise<void> {
    // load servers onto the manager
    const allContainers = await this.containerManager.list({ all: true });
    const mcContainers = allContainers.filter((c) => (c.image = this.image));
    const servers: Server[] = mcContainers.map(
      (c) => new Server({ container: c })
    );
    this.serverManager = new ServerManager({
      servers: new ServerCollection(servers),
      name: this.name,
    });
    console.log('minecraft servers: ', await this.serverManager.list());
  }
}
