import { InternalError } from './exceptions/internal-error';
import { Container } from 'dockerode';
import { docker } from './docker';
import { getContainerInfo, getFormattedTime } from './utils';
import { EventEmitter } from 'stream';

/**
 * Enumeration representing the possible status values of a container.
 */
export enum ContainerStatus {
  OFFLINE = 'offline',
  ONLINE = 'online',
}

/**
 * Options to configure the ContainerController.
 */
export interface ContainerControllerOptions {
  /**
   * Name of the container.
   */
  containerName: string;
}

export declare interface ContainerController {
  on(event: 'data', listener: (data: string) => void): this;
  on(event: 'status', listener: (status: ContainerStatus) => void): this;
}

/**
 * A class to monitor Docker container status and control the container's lifecycle.
 * It extends EventEmitter to emit specific events when the container's state changes or data is received.
 */
export class ContainerController extends EventEmitter {
  public static readonly DATA_EVENT = 'data';
  public static readonly STATUS_EVENT = 'status';

  private _container: Container | undefined;
  private _status: ContainerStatus;

  /**
   * Name of the container to be watched.
   */
  public readonly name: string;

  public id: string = '';

  /**
   * Creates a new ContainerController instance.
   *
   * @param opts - Configuration options for the Controller.
   */
  constructor(opts: ContainerControllerOptions) {
    super();
    this.name = opts.containerName;
    this._status = ContainerStatus.OFFLINE;
  }

  /**
   * Initializes the ContainerController, fetching container information and setting up event listeners.
   */
  public async init(): Promise<void> {
    const containerInfo = await getContainerInfo(this.name);

    if (!containerInfo)
      throw new InternalError(
        `Could not find container with this name: ${this.name}`
      );

    this.id = containerInfo.Id;
    this._container = docker.getContainer(containerInfo.Id);

    const stream = await docker.getEvents();
    stream.on('data', this.handleDockerEvent);

    // check container's status
    const found = await getContainerInfo(this.name, false);
    const currentStatus = found
      ? ContainerStatus.ONLINE
      : ContainerStatus.OFFLINE;
    this.setStatus(currentStatus);

    // only attach streams if the container is running
    // to avoid attaching more than one output streams
    if (this.status === ContainerStatus.ONLINE) this.attachStreams();
  }

  public disconnect() {
    this.removeAllListeners();
  }

  /**
   * Event handler for Docker container events.
   */
  private handleDockerEvent = (data: any): void => {
    const event = JSON.parse(data.toString());

    if ('/' + event.Actor.Attributes.name !== this.name) return;

    switch (event.status) {
      case 'start':
        this.setStatus(ContainerStatus.ONLINE);
        this.attachStreams();
        break;
      case 'die':
        this.setStatus(ContainerStatus.OFFLINE);
        break;
    }
  };

  /**
   * Sets up streams for monitoring the container's stdout and stderr.
   */
  private attachStreams(): void {
    this.ensureContainerInitialized();

    this._container!.attach(
      {
        stream: true,
        stdin: true,
        stdout: true,
        stderr: true,
      },
      (_, stream) => {
        stream?.on('data', (chunk) => {
          this.emit(ContainerController.DATA_EVENT, chunk.toString());
        });
      }
    );
  }

  /**
   * Starts the container.
   */
  public async start(): Promise<void> {
    this.ensureContainerInitialized();
    await this._container!.start();
  }

  /**
   * Stops the container.
   */
  public async stop(): Promise<void> {
    this.ensureContainerInitialized();
    await this._container!.stop();
  }

  /**
   * Restarts the container.
   */
  public async restart(): Promise<void> {
    this.ensureContainerInitialized();
    await this._container!.restart();
  }

  public async delete() {
    this.ensureContainerInitialized();
    await this._container!.remove();
  }

  /**
   * Fetches the logs of the container.
   *
   * @param limit - Optional number of lines to retrieve from the end of the logs.
   * @returns A promise which resolves to the logs as a string.
   */
  public async getLogs(limit?: number): Promise<string | undefined> {
    this.ensureContainerInitialized();

    const buffer = await this._container!.logs({
      follow: false, // Don't keep the connection open
      stdout: true,
      stderr: true,
      tail: limit,
    });

    return buffer.toString('utf-8');
  }

  /**
   * Sets the status of the container and emits a status event.
   *
   * @param status - The new status of the container.
   */
  public setStatus(status: ContainerStatus) {
    console.log(
      `[${getFormattedTime()}] ${this.name}: status changed to ${status}`
    );
    this._status = status;
    this.emit(ContainerController.STATUS_EVENT, status);
  }

  /**
   * Gets the current status of the container.
   *
   * @returns The current status of the container.
   */
  public get status(): ContainerStatus {
    return this._status;
  }

  /**
   * Checks if the container is initialized and throws an error if it's not.
   */
  private ensureContainerInitialized() {
    if (!this._container) {
      throw new InternalError(
        'Container controller not initialized. Try running init method.'
      );
    }
  }
}
