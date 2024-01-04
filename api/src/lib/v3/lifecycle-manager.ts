import { IContainer } from "./docker/docker-container";

export interface ILifecycleManager {
  setContainers(containers: IContainer[]): void;
  start(id: string): Promise<void>;
  stop(id: string): Promise<void>;
  restart(id: string): Promise<void>;
}

/**
 * Represents a manager for controlling the lifecycle of a group of containers.
 */
export class LifecycleManager implements ILifecycleManager {
  constructor(private containers: IContainer[] = []) {}

  /**
   * Sets the containers managed by the lifecycle manager.
   * @param containers An array of containers.
   */
  public setContainers(containers: IContainer[]) {
    this.containers = containers;
  }

  /**
   * Starts a container with the specified ID.
   * @param id The ID of the container to start.
   * @throws Error if the container is not found or is already running.
   */
  public async start(id: string): Promise<void> {
    const container = this.containers.find((c) => c.info.id === id);

    if (!container) throw new Error("Container not found");

    if (await container.isRunning())
      throw new Error("Container already running");

    await container.start();
  }

  /**
   * Stops a container with the specified ID.
   * @param id The ID of the container to stop.
   * @throws Error if the container is not found or is not running.
   */
  public async stop(id: string): Promise<void> {
    const container = this.containers.find((c) => c.info.id === id);

    if (!container) throw new Error("Container not found");

    if (!(await container.isRunning()))
      throw new Error("Container not running");

    await container.stop();
  }

  /**
   * Restarts a container with the specified ID.
   * @param id The ID of the container to restart.
   * @throws Error if the container is not found or is not running.
   */
  public async restart(id: string): Promise<void> {
    const container = this.containers.find((c) => c.info.id === id);

    if (!container) throw new Error("Container not found");

    if (!(await container.isRunning()))
      throw new Error("Container not running");

    await container.restart();
  }
}
