import { Server } from 'socket.io';
import { MinecraftServer } from './minecraft-server';
import { ContainerController, ContainerStatus } from './container-controller';
import { docker } from './docker';
import { BadRequestError } from './exceptions/bad-request-error';
import path from 'path';
import fs from 'fs/promises';
import { getContainerInfo } from './utils';
import { NameIdCollection } from './name-id-collection';
import { DockerContainerManager } from './docker-container-manager';
import { DockerContainer } from './docker-container';

interface UpdateMinecraftServerOpts {
  version?: string;
  type?: string;
}

interface CreateMinecraftServerOpts extends UpdateMinecraftServerOpts {
  name: string;
}

export class MinecraftServerManager {
  public static readonly CONTAINER_IMAGE = 'itzg/minecraft-server';

  public serverList: NameIdCollection<MinecraftServer>;
  private containerManager: DockerContainerManager;

  constructor(private io: Server) {
    this.serverList = new NameIdCollection<MinecraftServer>();
    this.containerManager = new DockerContainerManager();
  }

  public async init() {
    const allContainers = await this.containerManager.list({ all: true });

    for (const container of allContainers) {
      if (container.image !== MinecraftServerManager.CONTAINER_IMAGE) return;

      const server = new MinecraftServer({ container, io: this.io });
      await server.container.init();
      this.serverList.add(server);
    }
  }

  public async delete(
    id: string,
    includeVolume: boolean
  ): Promise<MinecraftServer> {
    const server = this.serverList.getById(id);

    if (!server)
      throw new BadRequestError('Server with this id not found: ' + id);

    await this.containerManager.delete({ id });

    if (includeVolume) {
      await fs.rm(server.sourceDirectory, { recursive: true, force: true });
    }

    this.serverList.remove(id);
    return server;
  }

  public list(): MinecraftServer[] {
    return this.serverList.values();
  }

  public async create(opts: CreateMinecraftServerOpts) {
    const formattedName =
      '/' + opts.name.toLowerCase().trim().replaceAll(' ', '-');

    // check if already exists
    const found = await getContainerInfo(formattedName);

    if (found)
      throw new BadRequestError(
        'Server with this name already exists: ' + formattedName
      );

    const serverPath = path.join(
      process.cwd(),
      '../server-data/minecraft/',
      formattedName
    );

    await fs.mkdir(serverPath, { recursive: true });

    const type = opts.type || 'VANILLA';
    const version = opts.version || 'LATEST';

    try {
      const newContainer = await this.containerManager.create({
        image: MinecraftServerManager.CONTAINER_IMAGE,
        name: formattedName,
        env: {
          EULA: 'true',
          TYPE: type,
          VERSION: version,
        },
        volumeBinds: [`${serverPath}:/data`],
        portBinds: { '25565/tcp': [{ HostPort: '25565' }] },
      });

      const server = new MinecraftServer({
        container: newContainer,
        io: this.io,
      });

      await server.container.init();
      this.serverList.add(server);
    } catch (err) {
      if (err instanceof Error)
        throw new BadRequestError(
          "Failed to create a new server. Make sure the server doesn't already exist."
        );
    }
  }

  public async update(id: string, opts: UpdateMinecraftServerOpts) {
    const server = this.serverList.getById(id);

    if (!server)
      throw new BadRequestError('Server with this id not found: ' + id);

    if (server.container.running)
      throw new BadRequestError('Server has to be stopped to update it');

    const oldContainer = docker.getContainer(id);

    const oldContainerInfo = await oldContainer.inspect();

    const versionBefore = oldContainerInfo.Config.Env.find((e) =>
      e.startsWith('VERSION')
    )
      ?.split('=')
      .at(1);
    const typeBefore = oldContainerInfo.Config.Env.find((e) =>
      e.startsWith('TYPE')
    )
      ?.split('=')
      .at(1);

    const oldName = oldContainerInfo.Name.replace('/', '');

    await oldContainer.rename({ name: oldContainerInfo.Name + '-old' });

    await this.create({
      name: oldName,
      type: opts.type || typeBefore,
      version: opts.version || versionBefore,
    });

    this.serverList.remove(id);
    await oldContainer.remove();
  }

  public async start(id: string) {
    const server = this.serverList.get(id);

    if (!server)
      throw new BadRequestError('Server with this id not found: ' + id);

    const canStart = (await this.list(false)).length == 0;

    if (!canStart)
      throw new BadRequestError('Can run only one server at a time');

    if (server.status === ContainerStatus.ONLINE)
      throw new BadRequestError('Server already running');

    await server.start();
  }

  public async stop(id: string) {
    const server = this.serverList.get(id);

    if (!server)
      throw new BadRequestError('Server with this id not found: ' + id);

    if (server.status === ContainerStatus.OFFLINE)
      throw new BadRequestError('Server already stopped');

    await server.stop();
  }

  public getServer(id: string) {
    const server = this.serverList.get(id);

    if (!server)
      throw new BadRequestError('Server with this id not found: ' + id);

    return server;
  }
}
