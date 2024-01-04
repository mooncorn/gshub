import { ContainerInspectInfo } from "dockerode";
import { DockerContainer, IDockerContainer } from "./docker-container";
import { docker } from "../docker";

export type CreateDockerContainerOpts = {
  name: string;
  image: string;
  env?: Record<string, string>;
  volumeBinds?: string[];
  portBinds?: Record<string, { HostPort: string }[]>;
};

export type UpdateDockerContainerOpts = Partial<CreateDockerContainerOpts>;

export interface IDockerContainerManager {
  getById(id: string): Promise<IDockerContainer>;
  getByName(name: string): Promise<IDockerContainer>;
  list({ all }: { all: boolean }): Promise<IDockerContainer[]>;
  create(opts: CreateDockerContainerOpts): Promise<DockerContainer>;
  delete({ id }: { id: string }): Promise<DockerContainer>;
  update({
    id,
    opts,
  }: {
    id: string;
    opts: UpdateDockerContainerOpts;
  }): Promise<DockerContainer>;
}

export class DockerContainerManager {
  private keyValueMapper: KeyValueMapper<string, string>;

  constructor() {
    this.keyValueMapper = new KeyValueMapper<string, string>("=");
  }

  public async getById(id: string): Promise<DockerContainer> {
    const container = docker.getContainer(id);
    let containerInspectInfo: ContainerInspectInfo;

    try {
      containerInspectInfo = await container.inspect();
    } catch (err) {
      throw Error(`Could not find container with id: ${id}`);
    }

    return new DockerContainer(this.mapToContainer(containerInspectInfo));
  }

  public async getByName(name: string): Promise<DockerContainer> {
    const containers = await this.list({ all: true });
    const found = containers.find((c) => c.name === name);
    if (!found) {
      throw Error(`Could not find container with name: ${name}`);
    }
    return found;
  }

  /**
   * Gets a list of running containers.
   */
  public async list({ all }: { all: boolean }): Promise<DockerContainer[]> {
    const containerInfoList = await docker.listContainers({ all });
    const myContainers = [];

    for (let containerInfo of containerInfoList) {
      myContainers.push(await this.getById(containerInfo.Id));
    }

    return myContainers;
  }

  public async create(
    opts: CreateDockerContainerOpts
  ): Promise<DockerContainer> {
    try {
      const found = await this.getByName(opts.name);
      if (!found) {
        throw Error(`Container already exists with this name: ${opts.name}`);
      }
    } catch (e) {}

    const container = await docker.createContainer({
      Image: opts.image,
      name: opts.name,
      Tty: true,
      Env: this.keyValueMapper.mapObjectToArray(opts.env || {}),
      HostConfig: {
        Binds: opts.volumeBinds,
        PortBindings: opts.portBinds,
      },
    });

    const containerInspectInfo = await container.inspect();
    return new DockerContainer(this.mapToContainer(containerInspectInfo));
  }

  public async delete({ id }: { id: string }): Promise<DockerContainer> {
    const container = await this.getById(id);
    const _container = docker.getContainer(id);
    await _container.remove();
    return container;
  }

  public async update({
    id,
    opts,
  }: {
    id: string;
    opts: UpdateDockerContainerOpts;
  }): Promise<DockerContainer> {
    const deletedContainer = await this.delete({ id });
    return await this.create({
      name: opts.name || deletedContainer.name,
      image: opts.image || deletedContainer.image,
      env: opts.env || deletedContainer.env,
      portBinds: opts.portBinds || deletedContainer.portBinds,
      volumeBinds: opts.volumeBinds || deletedContainer.volumeBinds,
    });
  }

  private mapToContainer(container: ContainerInspectInfo): DockerContainer {
    return new DockerContainer({
      id: container.Id,
      name: container.Name,
      image: container.Config.Image,
      env: this.keyValueMapper.mapArrayToObject(container.Config.Env),
      running: container.State.Running,
      volumeBinds: container.HostConfig.Binds || [],
      portBinds: container.HostConfig.PortBindings,
    });
  }
}

export class KeyValueMapper<K extends string | number, V> {
  constructor(public separator: string) {}

  mapArrayToObject(arr: string[]): Record<K, V> {
    const map = new Map<K, V>();

    for (const item of arr) {
      const kv = item.split(this.separator);
      const k = kv[0] as K;
      const v = kv[1] as V;

      if (k !== undefined && v !== undefined) {
        map.set(k, v);
      }
    }

    return Object.fromEntries(map) as Record<K, V>;
  }

  mapObjectToArray(obj: Record<K, V>): string[] {
    const arr = [];
    for (const [key, value] of Object.entries(obj)) {
      arr.push(`${key}${this.separator}${value}`);
    }
    return arr;
  }
}
