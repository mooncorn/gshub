import { IContainer } from "../../docker/docker-container";
import { Server } from "../server";

export class ValheimServer extends Server {
  constructor(container: IContainer) {
    super(container);
  }
}
