import "express-async-errors";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server as SocketServer } from "socket.io";
import { createServer } from "./lib/http-server";
import { errorHandler } from "./middleware/error-handler";
import { DockerService } from "./lib/v3/docker/docker-service";
import { SocketIO } from "./lib/socket-io";
import { minecraftCreateRouter } from "./routers/v3/servers/minecraft/create";
import { NotFoundError } from "./lib/exceptions/not-found-error";
import { minecraftStartRouter } from "./routers/v3/servers/minecraft/start";
import { env } from "./lib/env";
import { filesListRouter } from "./routers/v3/files/list";
import { minecraftDeleteRouter } from "./routers/v3/servers/minecraft/delete";
import { minecraftGetAllRouter } from "./routers/v3/servers/minecraft/get-all";
import { minecraftGetOneRouter } from "./routers/v3/servers/minecraft/get-one";
import { minecraftUpdateRouter } from "./routers/v3/servers/minecraft/update";
import { minecraftStopRouter } from "./routers/v3/servers/minecraft/stop";
import { minecraftRestartRouter } from "./routers/v3/servers/minecraft/restart";

const app = express();
const server = createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: env.CORS_ORIGIN,
  },
});

const docker = new DockerService({
  containersDirectory: env.CONTAINERS_DIR,
  eventEmitter: new SocketIO(io),
});

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    allowedHeaders: ["Cookie", "Content-Type"],
  })
);

app.use("/api/", [
  minecraftGetOneRouter,
  minecraftGetAllRouter,
  minecraftCreateRouter,
  minecraftUpdateRouter,
  minecraftDeleteRouter,
  minecraftStartRouter,
  minecraftStopRouter,
  minecraftRestartRouter,

  filesListRouter,
]);

app.all("*", async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { server, docker };
