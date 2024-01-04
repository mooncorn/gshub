import { IDockerContainer } from "./docker-container";

export class ContainerFilter {
  constructor(private image: string) {}

  public matches(container: IDockerContainer) {
    return container.image === this.image;
  }

  public filter(containers: IDockerContainer[]) {
    return containers.filter((container) => this.matches(container));
  }
}
