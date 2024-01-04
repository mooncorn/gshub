import { Container } from "dockerode";
import { IFileExplorer } from "../files/file-explorer";
import { IEventEmitter } from "../event-emitter";
import EventEmitter from "events";

export type ContainerEnv = Record<string, string>;
export type ContainerPortBinds = Record<string, { HostPort: string }[]>;
export type ContainerVolumeBinds = {
  root: string;
  binds: string[];
};
export type ContainerEventData<T> = {
  container: {
    id: string;
    name: string;
  };
  data: T;
};
export type ContainerInfo = {
  readonly id: string;
  readonly name: string;
  readonly image: string;
  readonly env: ContainerEnv;
  readonly volumeBinds?: ContainerVolumeBinds;
  readonly portBinds?: ContainerPortBinds;
};

export interface IContainer {
  files: IFileExplorer | undefined;
  info: ContainerInfo;
  init(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  restart(): Promise<void>;
  isRunning(): Promise<boolean>;
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

  constructor(
    public readonly info: ContainerInfo,
    private container: Container,
    public files: IFileExplorer | undefined,
    private readonly dockerEventStream: NodeJS.ReadableStream,
    private readonly eventEmitter: IEventEmitter = new EventEmitter()
  ) {}

  public async init() {
    await this.attachEventListeners();
  }

  public async isRunning(): Promise<boolean> {
    const inspectInfo = await this.container.inspect();
    return inspectInfo.State.Running;
  }

  private async attachEventListeners() {
    this.dockerEventStream.on("data", (data) => {
      const { Actor, status } = JSON.parse(data.toString());
      const eventContainerName = Actor.Attributes.name;

      if ("/" + eventContainerName !== this.info.name) return;

      const container = {
        id: this.info.id,
        name: this.info.name,
      };

      switch (status) {
        case "start":
          this.emitStatusChangedEvent(true);
          this.attachContainerOutput();
          break;
        case "die":
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
  }

  public async stop() {
    await this.container.stop();
  }

  public async restart() {
    await this.container.restart();
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
          id: this.info.id,
          name: this.info.name,
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
          id: this.info.id,
          name: this.info.name,
        },
        data: {
          logs,
        },
      }
    );
  }
}
