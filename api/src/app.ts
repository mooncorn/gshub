import "express-async-errors";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server as SocketServer } from "socket.io";
import { createServer } from "./lib/http-server";
import { errorHandler } from "./middleware/error-handler";
import { DockerService } from "./lib/v3/docker/docker-service";
import { SocketIO } from "./lib/socket-io";
import { minecraftCreateRouter } from "./routers/v3/minecraft-servers/create";
import { NotFoundError } from "./lib/exceptions/not-found-error";
import { minecraftStartRouter } from "./routers/v3/minecraft-servers/start";
import { env } from "./lib/env";
import { filesListRouter } from "./routers/v3/files/list";
import { minecraftDeleteRouter } from "./routers/v3/minecraft-servers/delete";
import { minecraftGetAllRouter } from "./routers/v3/minecraft-servers/get-all";
import { minecraftGetOneRouter } from "./routers/v3/minecraft-servers/get-one";

const app = express();
const server = createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: env.CORS_ORIGIN,
  },
});

const docker = new DockerService(env.CONTAINERS_DIR, new SocketIO(io));

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
  // minecraftUpdateRouter,
  minecraftDeleteRouter,
  minecraftStartRouter,
  // minecraftStopRouter,
  // minecraftRestartRouter,
  filesListRouter,
]);

app.all("*", async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { server, docker };
