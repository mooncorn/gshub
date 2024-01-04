import dotenv from "dotenv";
dotenv.config();
import "express-async-errors";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server as SocketServer } from "socket.io";
import { createServer } from "./lib/http-server";
import { errorHandler } from "./middleware/error-handler";
import { DockerService } from "./lib/v3/docker/docker-service";
import { SocketIO } from "./lib/socket-io";
import { MinecraftServerManager } from "./lib/v3/servers/minecraft/minecraft-server-manager";
import { ValheimServerManager } from "./lib/v3/servers/valheim/valheim-server-manager";
import { minecraftGetOneRouter } from "./routers/v3/minecraft-servers/get-one";
import { minecraftGetAllRouter } from "./routers/v3/minecraft-servers/get-all";
import { minecraftCreateRouter } from "./routers/v3/minecraft-servers/create";
import { minecraftUpdateRouter } from "./routers/v3/minecraft-servers/update";
import { minecraftDeleteRouter } from "./routers/v3/minecraft-servers/delete";
import { NotFoundError } from "./lib/exceptions/not-found-error";

const app = express();
const server = createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
  },
});

let minecraftServerManager: MinecraftServerManager;
let valheimServerManager: ValheimServerManager;

const containersDir = "/Users/david/Documents/GitHub/gshub/api/containers";

const docker = new DockerService(containersDir, new SocketIO(io));
docker.init().then(() => {
  minecraftServerManager = new MinecraftServerManager(
    docker,
    "itzg/minecraft-server"
  );
  valheimServerManager = new ValheimServerManager(
    docker,
    "lloesche/valheim-server"
  );
});

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
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
]);

app.all("*", async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { server, docker, minecraftServerManager, valheimServerManager };
