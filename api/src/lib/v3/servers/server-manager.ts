import { BadRequestError } from "../../exceptions/bad-request-error";
import { IContainer } from "../docker/docker-container";
import { IDocker } from "../docker/docker-service";
import { IServer } from "./server";

export type CreateServerOpts<T> = {
  image: string;
  name: string;
  env?: Record<string, string>;
  volumeBinds?: string[];
  portBinds?: Record<string, number>;
  createServer: (container: IContainer) => T;
};

export class ServerManager<T extends IServer> {
  protected servers: Map<string, T>;

  constructor(protected docker: IDocker, servers: T[]) {
    this.servers = new Map(servers.map((s) => [s.id, s]));
  }

  public get(id: string): T {
    const server = this.servers!.get(id);
    if (!server)
      throw new BadRequestError("Server with this id not found: " + id);

    return server;
  }

  public list(): T[] {
    return Array.from(this.servers!.values());
  }

  public async create(opts: CreateServerOpts<T>): Promise<T> {
    const container = await this.docker.create({
      image: opts.image,
      name: opts.name,
      env: opts.env,
      volumeBinds: opts.volumeBinds,
      portBinds: opts.portBinds,
    });

    const server = opts.createServer(container);
    this.servers.set(container.id, server);

    return server;
  }

  public async start(id: string): Promise<T> {
    const server = this.get(id);

    // // check if any other server is running
    // if (this.runOneAtATime) {
    //   const running = this.list().find((s) => s.running && s.id !== id);
    //   if (running) throw new BadRequestError("Another server is running");
    // }

    // check if a server on this port is already running
    // this.list().find(s => s.portBinds && s.portBinds['25565/tcp'].find(p => p.HostPort === server.portBinds['25565/tcp'].find(p => p.HostPort)))

    // check if server is already running
    const running = server.running;
    if (running) throw new BadRequestError("Server is already running");

    // start server
    await server.start();

    return server;
  }

  public async stop(id: string): Promise<T> {
    const server = this.get(id);

    // check if server is already stopped
    if (!server.running) throw new BadRequestError("Server is already stopped");

    // stop server
    await server.stop();

    return server;
  }

  public async restart(id: string): Promise<T> {
    const server = this.get(id);

    // check if server is already stopped
    if (!server.running) throw new BadRequestError("Server is already stopped");

    // restart server
    await server.restart();

    return server;
  }
}
