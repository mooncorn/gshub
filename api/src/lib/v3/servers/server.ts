import { IContainer } from "../docker/docker-container";
import { IFileExplorer } from "../files/file-explorer";

export interface IServer {
  readonly id: string;
  readonly name: string;
  readonly image: string;
  readonly env: Record<string, string>;
  readonly volumeBinds?: string[];
  readonly portBinds?: Record<string, { HostPort: string }[]>;
  files: IFileExplorer | undefined;
  start(): Promise<void>;
  stop(): Promise<void>;
  restart(): Promise<void>;
  getLogs(limit: number): Promise<string>;
  isRunning(): Promise<boolean>;
}

export class Server implements IServer {
  constructor(protected container: IContainer) {}

  public start = async () => await this.container.start();

  public stop = async () => await this.container.stop();

  public restart = async () => await this.container.restart();

  public getLogs = async (limit: number) => await this.container.getLogs(limit);

  public get id() {
    return this.container.id;
  }

  public get name() {
    return this.container.name;
  }

  public get image() {
    return this.container.image;
  }

  public get env() {
    return this.container.env;
  }

  public get volumeBinds() {
    return this.container.volumeBinds;
  }

  public get portBinds() {
    return this.container.portBinds;
  }

  public isRunning = () => this.container.isRunning();

  public get files() {
    return this.container.files;
  }
}
