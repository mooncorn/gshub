import { ServerProps } from '../server';
import { ServerManager } from '../server-manager';

export type ValheimServerManagerOptions = {
  image: string;
  name: string;
  serverManager: ServerManager;
};

export class ValheimServerManager {
  public readonly name: string;
  public readonly image: string;
  private readonly serverManager: ServerManager;

  constructor(opts: ValheimServerManagerOptions) {
    this.name = opts.name;
    this.image = opts.image;
    this.serverManager = opts.serverManager;
  }
}
