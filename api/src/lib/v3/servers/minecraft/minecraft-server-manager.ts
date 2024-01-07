import { BadRequestError } from "../../../exceptions/bad-request-error";
import { IDocker } from "../../docker/docker-service";
import { ServerManager } from "../server-manager";
import { MinecraftServer } from "./minecraft-server";

export interface UpdateMinecraftServerOpts {
  name?: string;
  version?: string;
  type?: string;
}

export interface CreateMinecraftServerOpts {
  name: string;
  version?: string;
  type?: string;
  port?: number;
}

const DEFAULT_CREATE_MC_SERVER_OPTS = {
  version: "LATEST",
  type: "VANILLA",
  port: 25565,
};

export class MinecraftServerManager extends ServerManager<MinecraftServer> {
  constructor(
    protected docker: IDocker,
    protected opts: {
      container: { port: number; image: string; volumes?: string[] };
    }
  ) {
    const servers = docker
      .list()
      .filter((c) => c.image === opts.container.image)
      .map((c) => new MinecraftServer(c));
    super(servers);
  }

  public async create(
    opts: CreateMinecraftServerOpts
  ): Promise<MinecraftServer> {
    const TYPE = opts.type || DEFAULT_CREATE_MC_SERVER_OPTS.type;
    const VERSION = opts.version || DEFAULT_CREATE_MC_SERVER_OPTS.version;
    const PORT = String(opts.port || DEFAULT_CREATE_MC_SERVER_OPTS.port);

    const container = await this.docker.create({
      image: this.opts.container.image,
      name: opts.name,
      env: {
        EULA: "true",
        TYPE,
        VERSION,
      },
      volumeBinds: ["/data"],
      portBinds: { "25565/tcp": PORT },
    });

    const server = new MinecraftServer(container);
    this.servers.set(container.id, server);

    return server;
  }

  public async update(
    id: string,
    opts: UpdateMinecraftServerOpts
  ): Promise<MinecraftServer> {
    const oldServer = this.get(id);

    // check if server is running
    if (oldServer.running)
      throw new BadRequestError("Server has to be stopped to update it");

    const name = opts.name || oldServer.name;
    const VERSION = opts.version || oldServer.env["VERSION"];
    const TYPE = opts.type || oldServer.env["TYPE"];

    const container = await this.docker.update({
      id,
      update: { name, env: { ...oldServer.env, VERSION, TYPE } },
    });

    this.servers!.delete(id);

    const server = new MinecraftServer(container);
    this.servers!.set(server.id, server);

    return server;
  }

  public async delete(id: string): Promise<MinecraftServer> {
    const server = this.get(id);

    await this.docker.delete(id, true);
    this.servers!.delete(id);

    return server!;
  }
}
