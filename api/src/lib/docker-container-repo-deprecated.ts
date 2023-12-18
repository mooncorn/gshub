import { DockerContainer } from './docker-container';
import { DockerContainerCollection } from './name-id-collection';
import {
  CreateDockerContainerOpts,
  DockerContainerManager,
  UpdateDockerContainerOpts,
} from './docker-container-manager';

/**
 * A controller class to manage containers and their respective instances simultaneously.
 */
export class DockerContainerRepo {
  private containerCollection: DockerContainerCollection;
  private dockerContainerManager: DockerContainerManager;

  constructor() {
    this.containerCollection = new DockerContainerCollection();
    this.dockerContainerManager = new DockerContainerManager();
  }

  async getById(id: string): Promise<DockerContainer> {
    const containerFromCollection = this.containerCollection.getById(id);

    if (containerFromCollection) {
      return containerFromCollection;
    }

    const containerFromManager = await this.dockerContainerManager.getById(id);
    this.containerCollection.add(containerFromManager);
    return containerFromManager;
  }

  async getByName(name: string): Promise<DockerContainer> {
    const containerFromCollection = this.containerCollection.getByName(name);

    if (containerFromCollection) {
      return containerFromCollection;
    }

    const containerFromManager = await this.dockerContainerManager.getByName(
      name
    );
    this.containerCollection.add(containerFromManager);
    return containerFromManager;
  }

  list({ all }: { all: boolean }): Promise<DockerContainer[]> {
    return new Promise((resolve, _) => {
      const containers = this.containerCollection.getAll();

      if (all) {
        resolve(containers);
        return;
      }

      const runningOnly = containers.filter((c) => c.running === true);
      resolve(runningOnly);
    });
  }

  async create(opts: CreateDockerContainerOpts): Promise<DockerContainer> {
    const createdContainer = await this.dockerContainerManager.create(opts);
    this.containerCollection.add(createdContainer);
    return createdContainer;
  }

  async delete({ id }: { id: string }): Promise<DockerContainer> {
    const deletedContainer = await this.dockerContainerManager.delete({ id });
    return this.containerCollection.remove(deletedContainer.id)!;
  }

  async update({
    id,
    opts,
  }: {
    id: string;
    opts: UpdateDockerContainerOpts;
  }): Promise<DockerContainer> {
    const containerFromCollection = this.containerCollection.getById(id);

    const updatedContainer = await this.dockerContainerManager.update({
      id,
      opts,
    });
    this.containerCollection.remove(containerFromCollection!.id);
    this.containerCollection.add(updatedContainer);
    return updatedContainer;
  }
}
