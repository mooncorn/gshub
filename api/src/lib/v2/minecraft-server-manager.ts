import { Server } from "socket.io";
import { ContainerController, ContainerStatus } from "../container-controller";
import { docker } from "../docker";
import { BadRequestError } from "../exceptions/bad-request-error";
import path from "path";
import fs from "fs/promises";
import { getContainerInfo } from "../utils";
import { Collection } from "./collection";
import {
  DockerContainerManager,
  IDockerContainerManager,
} from "./docker-container-manager";
import { DockerContainer } from "./docker-container";
import {
  IServerLifecycleController,
  ServerLifecycleController,
} from "./server-lifecycle-controller";
import { IEventEmitter } from "./io-event-emitter";
import { IServer, MinecraftServer } from "./minecraft-server";
import { ServerConsoleOutputEmitter } from "./server-console-output-emitter";
import { ServerStatusChangedEmitter } from "./server-status-changed-emitter";

/*
=== MINECRAFT SERVERS ===

GET /api/minecraft/servers - list()
  RESPONSE
    [
      {
        id: string,
        name: string,
        env: ...
        volumeBinds?: ...
        portBinds?: ...
        running: boolean
      }
    ]
GET /api/minecraft/servers/:id - get(id)
  RESPONSE
    server: {
      id: string,
      name: string,
      env: ...
      volumeBinds: ...
      portBinds: ...
      running: boolean
    }
POST /api/minecraft/servers
  REQUEST
    body: {
      name: string,
      version: string,
      plugins: boolean
    }
  RESPONSE
    server: {
      id: string,
      name: string,
      env: ...
      volumeBinds: ...
      portBinds: ...
      running: boolean
    }
PUT /api/minecraft/servers/:id
  REQUEST
    body: {
      name: string,
      version: string,
      plugins: boolean
    }
  RESPONSE 
    server: {
      id: string,
      name: string,
      env: ...
      volumeBinds: ...
      portBinds: ...
      running: boolean
    }
DELETE /api/minecraft/servers/:id
  RESPONSE
    server: {
      id: string,
      name: string,
      env: ...
      volumeBinds: ...
      portBinds: ...
      running: boolean
    }

=== MINECRAFT WORLDS ===

GET /api/minecraft/servers/:id/worlds -- list worlds
GET /api/minecraft/servers/:id/worlds/:name -- send data about one world
POST /api/minecraft/servers/:id/worlds
PUT /api/minecraft/servers/:id/worlds/:name -- allow renaming worlds, and activate it
DELETE /api/minecraft/servers/:id/worlds/:name

=== MINECRAFT PLAYERS ===

GET /api/minecraft/servers/:id/players -- list all players that visited the server
GET /api/minecraft/servers/:id/players/:uid -- return one player (last played, whitelisted)
POST /api/minecraft/servers/:id/players -- add a player
  REQUEST
    body: {
      name: string,
      whitelisted?: boolean = false
    }
DELETE /api/minecraft/servers/:id/players/:uid -- remove a player

=== MINECRAFT WHITELIST ===



*/

export interface ILifecycle {
  start(id: string): Promise<void>;
  stop(id: string): Promise<void>;
  restart(id: string): Promise<void>;
}

interface UpdateMinecraftServerOpts {
  version?: string;
  type?: string;
}

interface CreateMinecraftServerOpts extends UpdateMinecraftServerOpts {
  name: string;
}

export interface IMinecraftServerManager extends ILifecycle {
  get(id: string): ServerProps | undefined;
  list(): ServerProps[];
}

export type ServerProps = {
  id: string;
  name: string;
  env: Record<string, string>;
  running: boolean;
};

/**
 * Manages Minecraft servers.
 * - Creates new servers
 * - Updates existing servers
 * - Deletes servers
 * - Starts, stops, and restarts servers (OK)
 */
export class MinecraftServerManager implements IMinecraftServerManager {
  private servers: Collection<string, MinecraftServer>;
  private lifecycleController: IServerLifecycleController;
  private containerManager: IDockerContainerManager;

  constructor(private filterImage: string) {
    this.servers = new Collection<string, MinecraftServer>([]);
    this.lifecycleController = new ServerLifecycleController(this.servers);
    this.containerManager = new DockerContainerManager();
  }

  public init = async (): Promise<void> => {
    const containers = await this.containerManager.list({ all: true });

    const servers = containers
      .filter((c) => c.image === this.filterImage)
      .map((c) => {
        return new MinecraftServer(
          c,
          new ServerConsoleOutputEmitter(),
          new ServerStatusChangedEmitter()
        );
      });

    this.servers = new Collection<string, MinecraftServer>(servers);
  };

  public get = (id: string): ServerProps | undefined => {
    const server = this.servers.get(id);

    if (!server) return;

    return {
      id: server.id,
      name: server.name,
      env: server.env,
      running: server.running,
    };
  };

  public list = (): ServerProps[] => {
    const values = this.servers.values();

    return values.map((server) => ({
      id: server.id,
      name: server.name,
      env: server.env,
      running: server.running,
    }));
  };

  public start = async (id: string): Promise<void> =>
    this.lifecycleController.start(id);

  public stop = async (id: string): Promise<void> =>
    this.lifecycleController.stop(id);

  public restart = async (id: string): Promise<void> =>
    this.lifecycleController.restart(id);

  // public async create(
  //   opts: CreateMinecraftServerOpts
  // ): Promise<IMinecraftServer> {
  //   const formattedName =
  //     "/" + opts.name.toLowerCase().trim().replaceAll(" ", "-");

  //   // check if already exists
  //   const found = await getContainerInfo(formattedName);

  //   if (found)
  //     throw new BadRequestError(
  //       "Server with this name already exists: " + formattedName
  //     );

  //   const serverPath = path.join(
  //     process.cwd(),
  //     "../server-data/minecraft/",
  //     formattedName
  //   );

  //   await fs.mkdir(serverPath, { recursive: true });

  //   const type = opts.type || "VANILLA";
  //   const version = opts.version || "LATEST";

  //   try {
  //     const newContainer = await this.containerManager.create({
  //       image: MinecraftServerManager.CONTAINER_IMAGE,
  //       name: formattedName,
  //       env: {
  //         EULA: "true",
  //         TYPE: type,
  //         VERSION: version,
  //       },
  //       volumeBinds: [`${serverPath}:/data`],
  //       portBinds: { "25565/tcp": [{ HostPort: "25565" }] },
  //     });

  //     const server = new MinecraftServer({
  //       container: newContainer,
  //       io: this.io,
  //     });

  //     await server.container.init();
  //     this.servers.add(server);

  //     return server;
  //   } catch (err) {
  //     console.log(err);
  //     if (err instanceof Error)
  //       throw new BadRequestError(
  //         "Failed to create a new server. Make sure the server doesn't already exist."
  //       );

  //     throw new BadRequestError("Something unexpected happened!");
  //   }
  // }

  // public async update(
  //   id: string,
  //   opts: UpdateMinecraftServerOpts
  // ): Promise<IMinecraftServer> {
  //   const server = this.servers.getById(id);

  //   if (!server)
  //     throw new BadRequestError("Server with this id not found: " + id);

  //   if (server.container.running)
  //     throw new BadRequestError("Server has to be stopped to update it");

  //   const oldContainer = docker.getContainer(id);

  //   const oldContainerInfo = await oldContainer.inspect();

  //   const versionBefore = oldContainerInfo.Config.Env.find((e) =>
  //     e.startsWith("VERSION")
  //   )
  //     ?.split("=")
  //     .at(1);
  //   const typeBefore = oldContainerInfo.Config.Env.find((e) =>
  //     e.startsWith("TYPE")
  //   )
  //     ?.split("=")
  //     .at(1);

  //   const oldName = oldContainerInfo.Name.replace("/", "");

  //   await oldContainer.rename({ name: oldContainerInfo.Name + "-old" });

  //   const updatedServer = await this.create({
  //     name: oldName,
  //     type: opts.type || typeBefore,
  //     version: opts.version || versionBefore,
  //   });

  //   this.servers.remove(id);
  //   this.servers.add(updatedServer);

  //   await oldContainer.remove();

  //   return updatedServer;
  // }

  // public async delete(id: string): Promise<T> {
  //   const server = this.servers.get(id);

  //   if (!server) throw new ServerNotFoundError(id);

  //   await this.containerManager.delete({ id });

  //   // remove local volume
  //   await fs.rm(server.sourceDirectory, { recursive: true, force: true });

  //   this.servers.remove(id);
  //   return server;
  // }
}
