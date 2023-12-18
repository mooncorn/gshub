import { DockerContainer, IDockerContainerProps } from './docker-container';
import { DockerContainerManager } from './docker-container-manager';

export interface ServerProps {
  container: IDockerContainerProps;
}

export type ServerOptions = {
  container: DockerContainer;
};

export class BaseServer {
  private _container: DockerContainer;

  constructor(opts: ServerOptions) {
    this._container = opts.container;
  }

  get container() {
    return this._container;
  }
}

const dockerContainerManager = new DockerContainerManager();
const container = dockerContainerManager.create({
  image: 'test',
  name: 'test',
});
const baseServer = new BaseServer({ container });
