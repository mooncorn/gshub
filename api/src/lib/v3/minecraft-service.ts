import path from "path";
import { IDocker } from "./docker/docker-service";
import { ILifecycleManager, LifecycleManager } from "./lifecycle-manager";
import { IMinecraftServer, MinecraftServer } from "./minecraft-server";
import { IContainer } from "./docker/docker-container";

export type ServerContainer<T> = {
  server: T;
  container: IContainer;
};

export interface UpdateMinecraftServerOpts {
  version?: string;
  type?: string;
}

export interface CreateMinecraftServerOpts extends UpdateMinecraftServerOpts {
  name: string;
}

export interface IServerManager<Server, Create, Update> {
  start(id: string): Promise<void>;
  stop(id: string): Promise<void>;
  restart(id: string): Promise<void>;
  create(opts: Create): Promise<Server>;
  update(id: string, opts: Update): Promise<Server>;
  delete(id: string): Promise<void>;
  get(id: string): Server | undefined;
  list(): { server: Server; container: IContainer }[];
}

export class MinecraftService
  implements
    IServerManager<
      IMinecraftServer,
      CreateMinecraftServerOpts,
      UpdateMinecraftServerOpts
    >
{
  private readonly IMAGE = "itzg/minecraft-server";

  private servers: Map<string, ServerContainer<IMinecraftServer>>;
  private lifecycle: ILifecycleManager;

  constructor(private docker: IDocker, private dir: string) {
    const minecraftContainers = this.docker.list(
      (container) => container.image === this.IMAGE
    );

    this.servers = new Map();
    minecraftContainers.forEach((container) =>
      this.servers.set(container.info.id, {
        server: new MinecraftServer(container.info),
        container,
      })
    );

    this.lifecycle = new LifecycleManager(minecraftContainers);
  }

  get(id: string): IMinecraftServer | undefined {
    const serverContainer = this.servers.get(id);
    if (!serverContainer) return;
    return serverContainer.server;
  }

  list(): ServerContainer<IMinecraftServer>[] {
    return Array.from(this.servers.values());
  }

  public async create(
    opts: CreateMinecraftServerOpts
  ): Promise<IMinecraftServer> {
    // check if server with this name already exists
    const found = Object.values(this.servers).find(
      (server) => server.name === name
    );
    if (found) throw new Error("Server with this name already exists: " + name);

    // create container
    const TYPE = opts.type || "VANILLA";
    const VERSION = opts.version || "LATEST";

    const container = await this.docker.create({
      image: this.IMAGE,
      name,
      env: {
        EULA: "true",
        TYPE,
        VERSION,
      },
      volumeBinds: {
        root: path.join(this.dir, name),
        binds: ["/data"],
      },
      portBinds: { "25565/tcp": [{ HostPort: "25565" }] },
    });

    // create server
    const server = new MinecraftServer(container.info);
    this.servers.set(container.info.id, { server, container });

    return server;
  }

  async update(
    id: string,
    opts: UpdateMinecraftServerOpts
  ): Promise<IMinecraftServer> {
    // check if server exists
    const oldServer = this.servers.get(id);
    if (!oldServer) throw new Error("Server with this id not found: " + id);

    // check if server is running
    if (await oldServer.container.isRunning())
      throw new Error("Server has to be stopped to update it");

    // get old container info
    const oldContainerInfo = oldServer.container.info;

    const VERSION = opts.version || oldContainerInfo.env["VERSION"];
    const TYPE = opts.type || oldContainerInfo.env["TYPE"];

    const container = await this.docker.update({
      id,
      update: { env: { ...oldContainerInfo.env, VERSION, TYPE } },
    });

    this.servers.delete(id);
    const server = new MinecraftServer(container.info);
    this.servers.set(id, { server, container });

    return server;
  }

  async delete(id: string): Promise<void> {
    await this.docker.delete(id, true);
    this.servers.delete(id);
  }

  public async start(id: string): Promise<void> {
    await this.lifecycle.start(id);
  }

  public async stop(id: string): Promise<void> {
    await this.lifecycle.stop(id);
  }

  public async restart(id: string): Promise<void> {
    await this.lifecycle.restart(id);
  }
}
