import { ICollection } from './name-id-collection';
import { Server, ServerProps } from './server';

export type ServerManagerOptions = {
  servers: ServerCollection;
  name: string;
};

/**
 * Manage multiple servers making sure that:
 *  - only one is running at a time
 *  - returns only the server props (without the methods)
 */
export class ServerManager {
  private servers: ServerCollection;

  constructor(opts: ServerManagerOptions) {
    this.servers = opts.servers;
  }

  list(): Promise<ServerProps[]> {
    throw Error('Not implemented');
  }

  get(id: string): Promise<ServerProps> {
    throw Error('Not implemented');
  }

  getByName(name: string): Promise<ServerProps> {
    throw Error('Not implemented');
  }

  start(id: string): Promise<void> {
    throw Error('Not implemented');
  }

  stop(id: string): Promise<void> {
    throw Error('Not implemented');
  }

  restart(id: string): Promise<void> {
    throw Error('Not implemented');
  }
}

export class ServerCollection implements ICollection<Server> {
  public servers: Map<string, Server>;

  constructor(servers: Server[] = []) {
    this.servers = new Map();
    servers.forEach((s) => this.add(s));
  }

  add(item: Server): void {
    this.servers.set(item.container.id, item);
  }

  remove(id: string): Server | undefined {
    const server = this.servers.get(id);
    this.servers.delete(id);
    return server;
  }

  getById(id: string): Server | undefined {
    return this.servers.get(id);
  }

  getAll(): Server[] {
    return Array.from(this.servers.values());
  }

  has(id: string): boolean {
    return this.servers.has(id);
  }

  public forEach(handler: (server: Server) => void) {
    this.servers.forEach(handler);
  }
}
