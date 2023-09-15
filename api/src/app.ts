import dotenv from 'dotenv';
dotenv.config();
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { Server as SocketServer } from 'socket.io';
import { createServer } from './lib/http-server';
import { NotFoundError } from './lib/exceptions/not-found-error';
import { errorHandler } from './middleware/error-handler';
import { minecraftStartRouter } from './routers/minecraft/start';
import { minecraftStopRouter } from './routers/minecraft/stop';
import { minecraftStatusRouter } from './routers/minecraft/status';
import { minecraftCmdRouter } from './routers/minecraft/cmd';
import { minecraftConsoleRouter } from './routers/minecraft/console';
import { minecraftRestartRouter } from './routers/minecraft/restart';
import { fileExplorerUpdateRouter } from './routers/files/update';
import { fileExplorerListRouter } from './routers/files';
import { fileExplorerFileRouter } from './routers/files/file';
import { valheimStartRouter } from './routers/valheim/start';
import { valheimConsoleRouter } from './routers/valheim/console';
import { valheimStopRouter } from './routers/valheim/stop';
import { valheimRestartRouter } from './routers/valheim/restart';
import { valheimStatusRouter } from './routers/valheim/status';
import { createGameServers } from './lib/servers';

const app = express();
const server = createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
  },
});

const { minecraftServer, valheimServer } = createGameServers(io);

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    allowedHeaders: ['Cookie', 'Content-Type'],
  })
);

app.use([
  minecraftStartRouter,
  minecraftStopRouter,
  minecraftStatusRouter,
  minecraftCmdRouter,
  minecraftConsoleRouter,
  minecraftRestartRouter,
]);

app.use([
  valheimStartRouter,
  valheimStopRouter,
  valheimRestartRouter,
  valheimStatusRouter,
  valheimConsoleRouter,
]);

app.use('/api/minecraft/file-explorer', [
  fileExplorerListRouter,
  fileExplorerFileRouter,
  fileExplorerUpdateRouter,
]);

app.use('/api/valheim/file-explorer', [
  fileExplorerListRouter,
  fileExplorerFileRouter,
  fileExplorerUpdateRouter,
]);

app.all('*', async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { server as app, minecraftServer, valheimServer };
