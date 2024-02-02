import { Container } from "dockerode";
import { IFileExplorer } from "../files/file-explorer";
import { IEventEmitter } from "../event-emitter";
import EventEmitter from "events";

export type ContainerEventData<T> = {
  container: {
    id: string;
    name: string;
  };
  data: T;
};

export interface ContainerInfo {
  id: string;
  name: string;
  image: string;
  env: Record<string, string>;
  volumeBinds?: string[];
  portBinds?: Record<string, number>;
}

export interface IContainer extends ContainerInfo {
  running: boolean;
  init(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  restart(): Promise<void>;
  getLogs(limit: number): Promise<string>;
}

export declare interface DockerContainer {
  on(
    event: "running",
    callback: (data: ContainerEventData<{ running: boolean }>) => void
  ): void;
  on(
    event: "logs",
    callback: (data: ContainerEventData<{ logs: string }>) => void
  ): void;
}

export class DockerContainer implements IContainer {
  private readonly STATUS_CHANGED_EVENT = "statusChanged";
  private readonly LOGS_EVENT = "logs";

  public readonly id: string;
  private _name: string;
  public readonly image: string;
  public readonly env: Record<string, string>;
  public readonly volumeBinds?: string[];
  public readonly portBinds?: Record<string, number>;
  public running: boolean = false;

  constructor(
    info: ContainerInfo,
    private container: Container,
    public files: IFileExplorer | undefined,
    private readonly dockerEventStream: NodeJS.ReadableStream,
    private readonly eventEmitter: IEventEmitter = new EventEmitter()
  ) {
    this.id = info.id;
    this._name = info.name;
    this.image = info.image;
    this.env = info.env;
    this.volumeBinds = info.volumeBinds;
    this.portBinds = info.portBinds;
  }

  public async init() {
    await this.attachEventListeners();
    this.running = await this.isRunning();
  }

  private async isRunning(): Promise<boolean> {
    const inspectInfo = await this.container.inspect();
    return inspectInfo.State.Running;
  }

  private async attachEventListeners() {
    this.dockerEventStream.on("data", (data) => {
      const { Actor, status } = JSON.parse(data.toString());
      const eventContainerName = Actor.Attributes.name;

      if (eventContainerName !== this.name) return;

      switch (status) {
        case "start":
          this.running = true;
          this.emitStatusChangedEvent(true);
          this.attachContainerOutput();
          break;
        case "die":
          this.running = false;
          this.emitStatusChangedEvent(false);
          break;
      }
    });
  }

  private attachContainerOutput() {
    this.container.attach(
      {
        stream: true,
        stdin: true,
        stdout: true,
        stderr: true,
      },
      (_, stream) => {
        stream?.on("data", (chunk) => {
          this.emitLogsEvent(chunk.toString("utf-8"));
        });
      }
    );
  }

  public async start() {
    await this.container.start();
    this.running = true;
  }

  public async stop() {
    await this.container.stop();
    this.running = false;
  }

  public async restart() {
    await this.stop();
    await this.start();
  }

  public async getLogs(limit: number): Promise<string> {
    const buffer = await this.container.logs({
      follow: false, // Don't keep the connection open
      stdout: true,
      stderr: true,
      tail: limit,
    });

    return buffer.toString("utf-8");
  }

  public on<T>(event: string, callback: (data: T) => void): void {
    this.eventEmitter.on(event, callback);
  }

  private emitStatusChangedEvent(running: boolean) {
    this.eventEmitter.emit<ContainerEventData<{ running: boolean }>>(
      this.STATUS_CHANGED_EVENT,
      {
        container: {
          id: this.id,
          name: this.name,
        },
        data: {
          running,
        },
      }
    );
  }

  private emitLogsEvent(logs: string) {
    this.eventEmitter.emit<ContainerEventData<{ logs: string }>>(
      this.LOGS_EVENT,
      {
        container: {
          id: this.id,
          name: this.name,
        },
        data: {
          logs,
        },
      }
    );
  }

  public get name() {
    return this._name.replace("/", "");
  }

  public set name(newName: string) {
    this._name = "/" + newName;
  }
}
