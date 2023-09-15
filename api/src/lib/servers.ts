import { Server } from 'socket.io';
import { ContainerController } from './container-controller';
import { MinecraftServer } from './minecraft-server';
import { ValheimServer } from './valheim-server';

export function createGameServers(io: Server) {
  const minecraftServer = new MinecraftServer({
    io,
    controller: new ContainerController({
      containerName: 'gshub-minecraft-server-1',
    }),
    gameName: 'minecraft',
  });

  const valheimServer = new ValheimServer({
    io,
    controller: new ContainerController({ containerName: 'valheim-server' }),
    gameName: 'valheim',
  });

  return { minecraftServer, valheimServer };
}
