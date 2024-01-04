import { Container } from "dockerode";
import { Callback } from "./docker";
import { IFileExplorer } from "./file-explorer";

export type ContainerEnv = Record<string, string>;
export type ContainerPortBinds = Record<string, { HostPort: string }[]>;
export type ContainerVolumeBinds = {
  root: string;
  binds: string[];
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
  onStatusChanged: Callback<boolean> | undefined;
  onLogs: Callback<string> | undefined;
}

export class DockerodeContainer implements IContainer {
  public onStatusChanged: Callback<boolean> | undefined;
  public onLogs: Callback<string> | undefined;

  constructor(
    public readonly info: ContainerInfo,
    private container: Container,
    public files: IFileExplorer | undefined,
    private readonly dockerEventStream: NodeJS.ReadableStream
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

      switch (status) {
        case "start":
          this.onStatusChanged?.(true);
          this.attachContainerOutput();
          break;
        case "die":
          this.onStatusChanged?.(false);
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
          this.onLogs?.(chunk.toString());
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
}
