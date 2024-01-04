import { ContainerFilter } from "./container-filter";
import {
  DockerContainerManager,
  IDockerContainerManager,
} from "./docker-container-manager";
import { IEventEmitter } from "./io-event-emitter";
import { MinecraftServerManager } from "./minecraft-server-manager";
import { Collection } from "./collection";
import { MinecraftServer } from "./minecraft-server";
import { ServerConsoleOutputEmitter } from "./server-console-output-emitter";
import { ServerStatusChangedEmitter } from "./server-status-changed-emitter";

export class MinecraftServerManagerFactory {
  constructor(
    private eventEmitter: IEventEmitter,
    private containerFilter: ContainerFilter = new ContainerFilter(
      "itzg/minecraft-server"
    ),
    private containerManager: IDockerContainerManager = new DockerContainerManager()
  ) {}

  public async create(): Promise<MinecraftServerManager> {
    const containers = await this.containerManager.list({ all: true });
    const filterdContainers = this.containerFilter.filter(containers);
    const minecraftServers: MinecraftServer[] = [];

    for (let container of filterdContainers) {
      await container.init();
      const consoleOutputEmitter = new ServerConsoleOutputEmitter(
        this.eventEmitter,
        container
      );
      const statusChangedEmitter = new ServerStatusChangedEmitter(
        this.eventEmitter,
        container
      );
      const server = new MinecraftServer(
        container,
        consoleOutputEmitter,
        statusChangedEmitter
      );
      minecraftServers.push(server);
    }

    const collection = new Collection<string, MinecraftServer>(
      minecraftServers
    );
    return new MinecraftServerManager(collection);
  }
}
