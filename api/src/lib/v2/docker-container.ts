import EventEmitter from "events";
import { docker } from "../docker";

export declare interface IDockerContainerEvents {}

export type DockerContainerOptions = {
  id: string;
  name: string;
  image: string;
  running: boolean;
  env: Record<string, string>;
  volumeBinds: string[];
  portBinds: Record<string, { HostPort: string }[]>;
};

export interface IDockerContainer {
  id: string;
  name: string;
  image: string;
  running: boolean;
  env: Record<string, string>;
  volumeBinds: string[];
  portBinds: Record<string, { HostPort: string }[]>;
  init(): Promise<void>;
  terminate(): void;
  start(): Promise<void>;
  stop(): Promise<void>;
  restart(): Promise<void>;
  getLogs(limit: number): Promise<string>;
  on(event: "consoleOutput", listener: (data: string) => void): this;
  on(event: "statusChanged", listener: (running: boolean) => void): this;
}

export class DockerContainer extends EventEmitter implements IDockerContainer {
  public static readonly CONSOLE_OUTPUT_EVENT = "consoleOutput";
  public static readonly STATUS_CHANGED_EVENT = "statusChanged";

  public id: string;
  public name: string;
  public image: string;
  public running: boolean;
  public env: Record<string, string>;
  public volumeBinds: string[];
  public portBinds: Record<string, { HostPort: string }[]>;

  private dockerEventStream: NodeJS.ReadableStream | undefined;

  constructor(opts: DockerContainerOptions) {
    super();
    this.id = opts.id;
    this.name = opts.name;
    this.image = opts.image;
    this.running = opts.running;
    this.env = opts.env;
    this.volumeBinds = opts.volumeBinds;
    this.portBinds = opts.portBinds;
  }

  public async init(): Promise<void> {
    await this.attachContainerStatus();
  }

  public terminate(): void {
    this.removeAllListeners();
    this.dockerEventStream?.removeAllListeners();
    // @ts-ignore: Unreachable code error
    this.dockerEventStream?.destroy();
  }

  public async start(): Promise<void> {
    await docker.getContainer(this.id).start();
  }

  public async stop(): Promise<void> {
    await docker.getContainer(this.id).stop();
  }

  public async restart(): Promise<void> {
    await docker.getContainer(this.id).restart();
  }

  public async getLogs(limit: number): Promise<string> {
    const buffer = await docker.getContainer(this.id)!.logs({
      follow: false, // Don't keep the connection open
      stdout: true,
      stderr: true,
      tail: limit,
    });

    return buffer.toString("utf-8");
  }

  private setRunning(running: boolean): void {
    this.running = running;
    this.emit(DockerContainer.STATUS_CHANGED_EVENT, running);
  }

  private async attachContainerStatus() {
    this.dockerEventStream = await docker.getEvents();
    this.dockerEventStream.on("data", (data) => {
      const { Actor, status } = JSON.parse(data.toString());
      const eventContainerName = Actor.Attributes.name;

      if ("/" + eventContainerName !== this.name) return;

      switch (status) {
        case "start":
          this.setRunning(true);
          this.attachContainerOutput();
          break;
        case "die":
          this.setRunning(false);
          break;
      }
    });
  }

  private attachContainerOutput() {
    docker.getContainer(this.id).attach(
      {
        stream: true,
        stdin: true,
        stdout: true,
        stderr: true,
      },
      (_, stream) => {
        stream?.on("data", (chunk) => {
          this.emit(DockerContainer.CONSOLE_OUTPUT_EVENT, chunk.toString());
        });
      }
    );
  }

  public toObject() {
    return {
      id: this.id,
      name: this.name,
      image: this.image,
      running: this.running,
      env: this.env,
      // portBinds: this.portBinds,
    };
  }
}
