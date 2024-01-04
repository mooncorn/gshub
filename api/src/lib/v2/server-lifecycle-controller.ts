import { ICollection } from "./collection";
import { BadRequestError } from "../exceptions/bad-request-error";
import { ServerNotFoundError } from "../exceptions/server-not-found-error";
import { IServer } from "./minecraft-server";

export interface IServerLifecycleController {
  start(id: string): Promise<void>;
  stop(id: string): Promise<void>;
  restart(id: string): Promise<void>;
}

/**
 * Server lifecycle service, used to start, stop, and restart servers.
 * Makes sure there is only one server running at a time.
 */
export class ServerLifecycleController<T extends IServer>
  implements IServerLifecycleController
{
  constructor(private servers: ICollection<string, T>) {}

  public async start(id: string): Promise<void> {
    const server = this.servers.get(id);

    if (!server) throw new ServerNotFoundError(id);

    const canStart = this.servers.values().length == 0;

    if (!canStart)
      throw new BadRequestError("Can run only one server at a time");

    if (server.running) throw new BadRequestError("Server already running");

    await server.start();
  }

  public async stop(id: string): Promise<void> {
    const server = this.servers.get(id);

    if (!server) throw new ServerNotFoundError(id);

    if (!server.running) throw new BadRequestError("Server already stopped");

    await server.stop();
  }

  public async restart(id: string): Promise<void> {
    const server = this.servers.get(id);

    if (!server) throw new ServerNotFoundError(id);

    if (!server.running)
      throw new BadRequestError("Cannot restart offline server");

    await server.restart();
  }
}
