import path from "path";
import Docker from "dockerode";
import { FileExplorer, IFileExplorer } from "./file-explorer";
import { KeyValueMapper } from "./key-value-mapper";
import {
  ContainerEnv,
  ContainerInfo,
  ContainerPortBinds,
  ContainerVolumeBinds,
  DockerodeContainer,
  IContainer,
} from "./container";

export type Callback<T> = (data: T) => void;

export type ListContainersOpts = (container: ContainerInfo) => boolean;
export type CreateContainerOpts = {
  name: string;
  image: string;
  env?: ContainerEnv;
  volumeBinds?: ContainerVolumeBinds;
  portBinds?: ContainerPortBinds;
};
export type UpdateContainerOpts = {
  id: string;
  update: Partial<CreateContainerOpts>;
};

export interface IDocker {
  getContainer(id: string): IContainer | undefined;
  list(filter?: ListContainersOpts): IContainer[];
  create(opts: CreateContainerOpts): Promise<IContainer>;
  delete(id: string, deleteVolume: boolean): Promise<void>;
  update(opts: UpdateContainerOpts): Promise<IContainer>;
}

export class DockerodeDocker implements IDocker {
  private dockerEventStream: NodeJS.ReadableStream | undefined;
  private keyValueMapper: KeyValueMapper<string, string>;
  private collection: Map<string, IContainer>;
  private docker: Docker;

  constructor() {
    this.docker = new Docker();
    this.collection = new Map();
    this.keyValueMapper = new KeyValueMapper("=");
  }

  public async init(): Promise<void> {
    this.dockerEventStream = await this.docker.getEvents();

    const allContainers = await this.docker.listContainers({ all: true });

    for (let containerInfo of allContainers) {
      const container = this.docker.getContainer(containerInfo.Id);
      const info = await container.inspect();
      console.log(info.HostConfig.Binds);
      let files: IFileExplorer | undefined;

      const volumeBinds = this.parseHostPathsToVolumeBinds(
        info.HostConfig.Binds
      );

      if (volumeBinds) {
        files = new FileExplorer(volumeBinds.root);
      }

      const dockerodeContainer = new DockerodeContainer(
        {
          id: info.Id,
          name: info.Name,
          image: info.Config.Image,
          env: this.keyValueMapper.mapArrayToObject(info.Config.Env),
          volumeBinds,
          portBinds: info.HostConfig.PortBindings,
        },
        container,
        files,
        this.dockerEventStream!
      );
      await dockerodeContainer.init();
      this.collection.set(info.Id, dockerodeContainer);
    }
  }

  public getContainer(id: string): IContainer | undefined {
    return this.collection.get(id);
  }

  public list(filter: ListContainersOpts | undefined): IContainer[] {
    const containers = [...this.collection.values()];

    if (filter) {
      return containers.filter((container) => filter!(container.info));
    }

    return containers;
  }

  public async create(opts: CreateContainerOpts): Promise<IContainer> {
    const found =
      this.list((container) => container.name === opts.name).length > 0;

    if (found) {
      throw new Error(`Container with name ${opts.name} already exists.`);
    }

    const container = await this.docker.createContainer({
      Image: opts.image,
      name: opts.name,
      Tty: true,
      Env: this.keyValueMapper.mapObjectToArray(opts.env || {}),
      HostConfig: {
        Binds: this.parseVolumeBindsToHostPaths(opts.volumeBinds),
        PortBindings: opts.portBinds,
      },
    });

    const info = await container.inspect();

    let files: IFileExplorer | undefined;

    if (info.HostConfig.Binds && info.HostConfig.Binds.length > 0) {
      const rootDir = path.join(info.HostConfig.Binds[0].split(":")[0], "..");
      files = new FileExplorer(rootDir);
    }

    const dockerodeContainer = new DockerodeContainer(
      {
        id: info.Id,
        name: info.Name,
        image: info.Config.Image,
        env: this.keyValueMapper.mapArrayToObject(info.Config.Env),
        volumeBinds: this.parseHostPathsToVolumeBinds(info.HostConfig.Binds),
        portBinds: info.HostConfig.PortBindings,
      },
      container,
      files,
      this.dockerEventStream!
    );
    this.collection.set(info.Id, dockerodeContainer);
    await dockerodeContainer.init();
    return dockerodeContainer;
  }

  public async delete(id: string, deleteVolume: boolean): Promise<void> {
    const container = this.getContainer(id);

    if (!container) {
      throw new Error(`Container with ID ${id} does not exist.`);
    }

    // Remove container from docker
    await this.docker.getContainer(id).remove({ force: true });

    // Remove local volume
    if (deleteVolume) {
      this.collection.get(id)?.files?.delete();
    }

    // Remove container from memory
    this.collection.delete(id);
  }

  public async update(opts: UpdateContainerOpts): Promise<IContainer> {
    const prevContainer = this.getContainer(opts.id);

    if (!prevContainer) {
      throw new Error(`Container with ID ${opts.id} does not exist.`);
    }

    await this.delete(opts.id, false);

    return await this.create({
      name: opts.update.name || prevContainer.info.name,
      image: opts.update.image || prevContainer.info.image,
      env: opts.update.env || prevContainer.info.env,
      portBinds: opts.update.portBinds || prevContainer.info.portBinds,
      volumeBinds: opts.update.volumeBinds || prevContainer.info.volumeBinds,
    });
  }

  private parseVolumeBindsToHostPaths(
    volumeBinds: ContainerVolumeBinds | undefined
  ): string[] {
    if (!volumeBinds) return [];

    return volumeBinds.binds.map(
      (bind) => `${volumeBinds.root}${bind}:${bind}`
    );
  }

  private parseHostPathsToVolumeBinds(
    hostPaths: string[] | undefined
  ): ContainerVolumeBinds | undefined {
    if (!hostPaths || hostPaths.length === 0) return;

    const binds = hostPaths.map((hostPath) => hostPath.split(":")[1]);
    const bind = binds.at(0)!;
    const root = hostPaths[0].split(":")[0].replace(bind, "");

    return { root, binds };
  }
}
