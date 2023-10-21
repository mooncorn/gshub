import { Server } from 'socket.io';
import { MinecraftServer } from './minecraft-server';
import { ContainerController, ContainerStatus } from './container-controller';
import { docker } from './docker';
import { BadRequestError } from './exceptions/bad-request-error';
import path from 'path';
import fs from 'fs/promises';
import { getContainerInfo } from './utils';

interface MinecraftContainerOptions extends MinecraftServerOptions {
  name: string;
}

export interface MinecraftServerOptions {
  version?: string;
  type?: string;
}

// sorry to whoever reads this
export class MinecraftServerManager {
  public servers: MinecraftServer[] = [];

  constructor(private io: Server) {}

  // fetch server list from db and initialize them
  public async init() {
    // disconnect event listeners
    for (let server of this.servers) {
      server.controller.disconnect();
    }

    this.servers = [];

    const minecraftContainers = await this.list(true);

    for (let container of minecraftContainers) {
      const server = new MinecraftServer({
        controller: new ContainerController({
          containerName: container.Names[0],
        }),
        io: this.io,
      });

      await server.init();

      this.servers.push(server);
    }

    // log
    console.log(
      this.servers.map((s) => {
        return {
          name: s.controller.name,
          id: s.controller.id,
          status: s.status,
        };
      })
    );
  }

  public async delete(id: string, includeVolume: boolean) {
    const server = this.servers.find((s) => s.controller.id === id);

    if (!server)
      throw new BadRequestError('Server with this id not found: ' + id);

    await server.delete(includeVolume);

    server.controller.disconnect();

    this.servers = this.servers.filter(
      (s) => s.controller.id !== server.controller.id
    );
  }

  public async list(all: boolean) {
    const allContainers = await docker.listContainers({ all });
    return allContainers.filter((c) => c.Image === 'itzg/minecraft-server');
  }

  public async create(opts: MinecraftContainerOptions) {
    const formattedName =
      '/' + opts.name.toLowerCase().trim().replaceAll(' ', '-');

    // check if already exists
    const found = await getContainerInfo('/' + formattedName);

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
      await docker.createContainer({
        Image: 'itzg/minecraft-server',
        name: formattedName,
        Env: ['EULA=true', `TYPE=${type}`, `VERSION=${version}`],
        HostConfig: {
          Binds: [`${serverPath}:/data`],
          PortBindings: { '25565/tcp': [{ HostPort: '25565' }] },
        },
      });
    } catch (err) {
      if (err instanceof Error)
        throw new BadRequestError(
          "Failed to create a new server. Make sure the server doesn't already exist."
        );
    }

    const server = new MinecraftServer({
      controller: new ContainerController({ containerName: formattedName }),
      io: this.io,
    });

    await server.init();

    this.servers.push(server);

    // log
    console.log('Created: ', {
      name: server.controller.name,
      id: server.controller.id,
      status: server.status,
    });
  }

  public async update(id: string, opts: MinecraftServerOptions) {
    const server = this.servers.find((s) => s.controller.id === id);

    if (!server)
      throw new BadRequestError('Server with this id not found: ' + id);

    if (server.status === ContainerStatus.ONLINE)
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

    console.log(versionBefore, typeBefore);

    const oldName = oldContainerInfo.Name.replace('/', '');

    await oldContainer.rename({ name: oldContainerInfo.Name + '-old' });

    await this.create({
      name: oldName,
      type: opts.type || typeBefore,
      version: opts.version || versionBefore,
    });

    // update internal state: disconnect event listeners and remove server from array
    this.servers.find((s) => s.controller.id === id)?.controller.disconnect();
    this.servers = this.servers.filter((s) => s.controller.id !== id);

    await oldContainer.remove();
  }

  public async start(id: string) {
    const server = this.servers.find((s) => s.controller.id === id);

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
    const server = this.servers.find((s) => s.controller.id === id);

    if (!server)
      throw new BadRequestError('Server with this id not found: ' + id);

    if (server.status === ContainerStatus.OFFLINE)
      throw new BadRequestError('Server already stopped');

    await server.stop();
  }

  public getServer(id: string) {
    const server = this.servers.find((s) => s.controller.id === id);

    if (!server)
      throw new BadRequestError('Server with this id not found: ' + id);

    return server;
  }
}
