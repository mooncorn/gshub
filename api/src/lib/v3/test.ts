import { DockerodeDocker } from "./docker/docker-service";
import { MinecraftService } from "./minecraft-service";

const docker = new DockerodeDocker();
const CONTAINER_DIR = "/Users/david/Documents/GitHub/gshub/containers";

const start = async () => {
  await docker.init();

  const minecraftService = new MinecraftService(docker, CONTAINER_DIR);
  const list = minecraftService.list();

  await minecraftService.update(list.at(0)?.container.info.id!, {
    version: "1.16.1",
  });

  console.log(list);
};

start();
