import fs from "fs/promises";
import Docker from "dockerode";
import { FileExplorer, IFileExplorer } from "../files/file-explorer";
import { KeyValueMapper } from "../key-value-mapper";
import { ContainerInfo, DockerContainer, IContainer } from "./docker-container";
import { IEventEmitter } from "../event-emitter";
import EventEmitter from "events";
import { BadRequestError } from "../../exceptions/bad-request-error";
import path from "path";

export type Callback<T> = (data: T) => void;

export type ListContainersOpts = (container: ContainerInfo) => boolean;
export type CreateContainerOpts = {
  name: string;
  image: string;
  env?: Record<string, string>;
  volumeBinds?: string[];
  portBinds?: Record<string, number>;
};
export type UpdateContainerOpts = {
  id: string;
  update: Partial<CreateContainerOpts>;
};

export interface IDocker {
  readonly containersDirectory: string;
  getContainer(id: string): IContainer;
  list(filter?: ListContainersOpts): IContainer[];
  create(opts: CreateContainerOpts): Promise<IContainer>;
  delete(id: string, deleteVolume: boolean): Promise<IContainer>;
  update(opts: UpdateContainerOpts): Promise<IContainer>;
}

export class DockerService implements IDocker {
  private dockerEventStream: NodeJS.ReadableStream | undefined;
  private keyValueMapper: KeyValueMapper<string, string>;
  private containers: Map<string, IContainer>;
  private docker: Docker;

  constructor(
    public readonly containersDirectory: string,
    private eventEmitter: IEventEmitter = new EventEmitter()
  ) {
    this.docker = new Docker();
    this.containers = new Map();
    this.keyValueMapper = new KeyValueMapper("=");
  }

  /**
   * Initializes the Docker service by fetching the Docker event stream,
   * and initializing each container.
   * @returns A Promise that resolves when the initialization is complete.
   */
  public async init(): Promise<void> {
    this.dockerEventStream = await this.docker.getEvents();

    const allContainers = await this.docker.listContainers({ all: true });

    for (let containerInfo of allContainers) {
      const container = this.docker.getContainer(containerInfo.Id);
      const info = await container.inspect();

      let files: IFileExplorer | undefined;

      const volumeBinds = this.mapToInternalVolumeBinds(info.HostConfig.Binds);

      if (volumeBinds) {
        files = new FileExplorer(
          path.join(this.containersDirectory, info.Name)
        );
      }

      const dockerContainer = new DockerContainer(
        {
          id: info.Id,
          name: info.Name,
          image: info.Config.Image,
          env: this.keyValueMapper.mapArrayToObject(info.Config.Env),
          volumeBinds: this.mapToInternalVolumeBinds(info.HostConfig.Binds),
          portBinds: this.mapToInternalPortBinds(info.HostConfig.PortBindings),
        },
        container,
        files,
        this.dockerEventStream!,
        this.eventEmitter
      );

      await dockerContainer.init();
      this.containers.set(info.Id, dockerContainer);
    }
  }

  /**
   * Retrieves a container by its ID.
   * @param id The ID of the container to retrieve.
   * @returns The container with the specified ID.
   * @throws `BadRequestError` if the container does not exist.
   */
  public getContainer(id: string): IContainer {
    this.ensureInitialized();

    const container = this.containers.get(id);
    if (!container) {
      throw new BadRequestError(`Container with ID ${id} does not exist.`);
    }

    return container;
  }

  /**
   * Retrieves a list of containers.
   * @param filter A function that filters the list of containers.
   * @returns A list of containers.
   */
  public list(filter?: ListContainersOpts): IContainer[] {
    this.ensureInitialized();

    const containers = [...this.containers.values()];

    if (filter) {
      return containers.filter((container) => filter!(container));
    }

    return containers;
  }

  /**
   * Creates a new Docker container with the specified options.
   *
   * @param opts - The options for creating the container.
   * @returns A promise that resolves to the created container.
   * @throws `BadRequestError` if the name is invalid or already in use.
   */
  public async create(opts: CreateContainerOpts): Promise<IContainer> {
    this.ensureInitialized();

    const name = this.parseName(opts.name);

    if (this.containerNameExists(name)) {
      throw new BadRequestError(`Name '${name}' is already in use.`);
    }

    const container = await this.docker.createContainer({
      Image: opts.image,
      name,
      Tty: true,
      Env: this.keyValueMapper.mapObjectToArray(opts.env),
      HostConfig: {
        Binds: this.mapToExternalVolumeBinds(name, opts.volumeBinds),
        PortBindings: this.mapToExternalPortBinds(opts.portBinds),
      },
    });

    const info = await container.inspect();

    let files: IFileExplorer | undefined;

    if (opts.volumeBinds && opts.volumeBinds.length > 0) {
      files = new FileExplorer(path.join(this.containersDirectory, name));
    }

    const dockerContainer = new DockerContainer(
      {
        id: info.Id,
        name: info.Name,
        image: info.Config.Image,
        env: this.keyValueMapper.mapArrayToObject(info.Config.Env),
        volumeBinds: this.mapToInternalVolumeBinds(info.HostConfig.Binds),
        portBinds: this.mapToInternalPortBinds(info.HostConfig.PortBindings),
      },
      container,
      files,
      this.dockerEventStream!,
      this.eventEmitter
    );

    this.containers.set(info.Id, dockerContainer);
    await dockerContainer.init();
    return dockerContainer;
  }

  /**
   * Deletes a Docker container with the specified ID.
   * @param id The ID of the container to delete.
   * @param deleteVolume Whether to delete the container's local volume.
   * @returns A promise that resolves to the deleted container.
   */
  public async delete(id: string, deleteVolume: boolean): Promise<IContainer> {
    this.ensureInitialized();

    const container = this.getContainer(id);

    // Remove container from docker
    await this.docker.getContainer(id).remove({ force: true });

    // Remove local volume
    if (deleteVolume) {
      container.files?.delete();
    }

    // Remove container from memory
    this.containers.delete(id);

    return container;
  }

  /**
   * Updates a Docker container with the specified options.
   * @param opts The options for updating the container.
   * @returns A promise that resolves to the updated container.
   */
  public async update(opts: UpdateContainerOpts): Promise<IContainer> {
    this.ensureInitialized();

    if (opts.update.name) {
      const name = this.parseName(opts.update.name);

      if (this.containerNameExists(name)) {
        throw new BadRequestError(`Name '${name}' is already in use.`);
      }
    }

    const prevContainer = await this.delete(opts.id, false);

    const container = await this.create({
      name: opts.update.name || prevContainer.name,
      image: opts.update.image || prevContainer.image,
      env: opts.update.env || prevContainer.env,
      portBinds: opts.update.portBinds || prevContainer.portBinds,
      volumeBinds: opts.update.volumeBinds || prevContainer.volumeBinds,
    });

    // Move files to new directory if name changed
    if (
      opts.update.name &&
      container.name !== prevContainer.name &&
      container.files
    ) {
      this.moveDirectory(
        path.join(this.containersDirectory, prevContainer.name),
        path.join(this.containersDirectory, container.name)
      );

      container.files = new FileExplorer(
        path.join(this.containersDirectory, container.name)
      );
    }

    return container;
  }

  private mapToExternalVolumeBinds(
    containerName: string,
    volumeBinds: string[] | undefined
  ): string[] | undefined {
    if (!volumeBinds || volumeBinds.length === 0) return;

    return volumeBinds.map(
      (bind) =>
        `${path.join(this.containersDirectory, containerName, bind)}:${bind}`
    );
  }

  private mapToInternalVolumeBinds(
    hostPaths: string[] | undefined
  ): string[] | undefined {
    if (!hostPaths || hostPaths.length === 0) return;

    return hostPaths.map((hostPath) => hostPath.split(":")[1]);
  }

  private mapToInternalPortBinds(
    portBinds:
      | {
          [key: string]: { HostPort: string }[];
        }
      | undefined
  ): Record<string, number> {
    if (!portBinds) return {};

    const parsed: Record<string, number> = {};

    for (let [key, value] of Object.entries(portBinds)) {
      if (value.length === 0) continue;

      parsed[key] = parseInt(value.at(0)!.HostPort);
    }

    return parsed;
  }

  private mapToExternalPortBinds(
    portBinds: Record<string, number> | undefined
  ): {
    [key: string]: { HostPort: string }[];
  } {
    if (!portBinds) return {};

    const parsed: {
      [key: string]: { HostPort: string }[];
    } = {};

    for (let [key, value] of Object.entries(portBinds)) {
      parsed[key] = [{ HostPort: value.toString() }];
    }

    return parsed;
  }

  private parseName(name: string): string {
    const isNameValid = name.match(/^[a-zA-Z0-9][a-zA-Z0-9_.-]+$/);
    if (!isNameValid)
      throw new BadRequestError(
        "Invalid server name. Only alphanumeric characters, spaces, and dashes are allowed."
      );

    return name.toLowerCase().trim().replace(" ", "-");
  }

  private containerNameExists(name: string): boolean {
    return this.list((container) => container.name === name).length > 0;
  }

  private async moveDirectory(src: string, dest: string): Promise<void> {
    try {
      await fs.access(src);
    } catch (e) {
      return;
    }

    await fs.rename(src, dest);
  }

  public get initialized() {
    return this.dockerEventStream !== undefined;
  }

  private ensureInitialized() {
    if (!this.initialized) {
      throw new Error("Docker service not initialized");
    }
  }
}
