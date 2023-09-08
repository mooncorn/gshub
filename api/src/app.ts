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
import { MinecraftServer } from './lib/minecraft-server';
import { minecraftStartRouter } from './routers/minecraft/start';
import { minecraftStopRouter } from './routers/minecraft/stop';
import { minecraftStatusRouter } from './routers/minecraft/status';
import { minecraftCmdRouter } from './routers/minecraft/cmd';
import { minecraftConsoleRouter } from './routers/minecraft/console';
import { minecraftRestartRouter } from './routers/minecraft/restart';
import { minecraftEditRouter } from './routers/minecraft/edit';
import { fileExplorerUpdateRouter } from './routers/files/update';
import { fileExplorerListRouter } from './routers/files';
import { fileExplorerFileRouter } from './routers/files/file';
import { valheimStartRouter } from './routers/valheim/start';
import { ValheimServer } from './lib/valheim-server';

const app = express();
const server = createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
  },
});

const minecraftServer = new MinecraftServer(io);
const valheimServer = new ValheimServer(io);

process.on('SIGINT', async () => {
  await minecraftServer.stop();
});

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    allowedHeaders: ['Cookie', 'Content-Type'],
  })
);

app.use(minecraftStartRouter);
app.use(minecraftStopRouter);
app.use(minecraftStatusRouter);
app.use(minecraftCmdRouter);
app.use(minecraftConsoleRouter);
app.use(minecraftRestartRouter);
app.use(minecraftEditRouter);

app.use('/api/minecraft/file-explorer', fileExplorerListRouter);
app.use('/api/minecraft/file-explorer', fileExplorerFileRouter);
app.use('/api/minecraft/file-explorer', fileExplorerUpdateRouter);

app.use(valheimStartRouter);

app.all('*', async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { server as app, minecraftServer, valheimServer };
