import { DockerContainerManager } from '../docker-container-manager';
import { MinecraftServerManager } from '../minecraft/minecraft-server-manager';

describe('minecraft-server-manager', () => {
  it('creates and initializes minecraft server manager', async () => {
    const mcManager = new MinecraftServerManager({
      containerManager: new DockerContainerManager(),
    });
    await mcManager.init();
  });
});
