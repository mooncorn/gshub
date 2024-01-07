import { BadRequestError } from '../../exceptions/bad-request-error';
import { IServer } from './server';

export class ServerManager<T extends IServer> {
  protected servers: Map<string, T>;

  constructor(servers: T[]) {
    this.servers = new Map(servers.map((s) => [s.id, s]));
  }

  public get(id: string): T {
    const server = this.servers!.get(id);
    if (!server)
      throw new BadRequestError('Server with this id not found: ' + id);

    return server;
  }

  public list(): T[] {
    return Array.from(this.servers!.values());
  }
}
