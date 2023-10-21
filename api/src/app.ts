import dotenv from 'dotenv';
dotenv.config();
import 'express-async-errors';
import express, { application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { Server as SocketServer } from 'socket.io';
import { createServer } from './lib/http-server';
import { NotFoundError } from './lib/exceptions/not-found-error';
import { errorHandler } from './middleware/error-handler';
import { minecraftStartRouter } from './routers/minecraft/server/start';
import { minecraftStopRouter } from './routers/minecraft/server/stop';
import { minecraftStatusRouter } from './routers/minecraft/server/status';
import { minecraftConsoleRouter } from './routers/minecraft/server/console';
import { minecraftRestartRouter } from './routers/minecraft/server/restart';
import { valheimStartRouter } from './routers/valheim/start';
import { valheimConsoleRouter } from './routers/valheim/console';
import { valheimStopRouter } from './routers/valheim/stop';
import { valheimRestartRouter } from './routers/valheim/restart';
import { valheimStatusRouter } from './routers/valheim/status';
import { MinecraftServerManager } from './lib/minecraft-server-manager';
import { minecraftCreateRouter } from './routers/minecraft/server/create';
import { minecraftListRouter } from './routers/minecraft/server/list';
import { minecraftUpdateRouter } from './routers/minecraft/server/update';
import { minecraftWorldUploadRouter } from './routers/minecraft/world/upload';
import { minecraftWorldListRouter } from './routers/minecraft/world/list';
import { minecraftWorldActivateRouter } from './routers/minecraft/world/set-active';
import { minecraftCmdRouter } from './routers/minecraft/server/cmd';
import { minecraftFilesContentRouter } from './routers/minecraft/files/content';
import { minecraftFilesListRouter } from './routers/minecraft/files/list';
import { minecraftFilesUpdateOneRouter } from './routers/minecraft/files/update';
import { minecraftRemoveRouter } from './routers/minecraft/server/delete';
import { logger } from './middleware/logger';
import { minecraftWhitelistGetRouter } from './routers/minecraft/whitelist/get';
import { minecraftWhitelistAddRouter } from './routers/minecraft/whitelist/add';
import { minecraftWhitelistRemoveRouter } from './routers/minecraft/whitelist/remove';
import { minecraftPlayersRouter } from './routers/minecraft/server/players';
import { ValheimServer } from './lib/valheim-server';
import { ContainerController } from './lib/container-controller';
import { valheimFilesListRouter } from './routers/valheim/files/list';
import { valheimFilesContentRouter } from './routers/valheim/files/content';
import { valheimFilesUpdateOneRouter } from './routers/valheim/files/update';

const app = express();
const server = createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
  },
});

const valheimServer = new ValheimServer({
  io,
  controller: new ContainerController({
    containerName: '/valheim-server',
  }),
});
const minecraftServerManager = new MinecraftServerManager(io);

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    allowedHeaders: ['Cookie', 'Content-Type'],
  })
);

app.use(logger);

// Minecraft Routers
app.use([
  // server
  minecraftStartRouter,
  minecraftStopRouter,
  minecraftStatusRouter,
  minecraftConsoleRouter,
  minecraftRestartRouter,
  minecraftCmdRouter,
  minecraftCreateRouter,
  minecraftListRouter,
  minecraftUpdateRouter,
  minecraftRemoveRouter,
  minecraftPlayersRouter,

  // world
  minecraftWorldUploadRouter,
  minecraftWorldListRouter,
  minecraftWorldActivateRouter,

  // files
  minecraftFilesContentRouter,
  minecraftFilesListRouter,
  minecraftFilesUpdateOneRouter,

  // whitelist
  minecraftWhitelistGetRouter,
  minecraftWhitelistAddRouter,
  minecraftWhitelistRemoveRouter,
]);

app.use([
  valheimStartRouter,
  valheimStopRouter,
  valheimRestartRouter,
  valheimStatusRouter,
  valheimConsoleRouter,

  // files
  valheimFilesListRouter,
  valheimFilesContentRouter,
  valheimFilesUpdateOneRouter,
]);

app.all('*', async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { server as app, valheimServer, minecraftServerManager };
