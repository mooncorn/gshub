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
import { minecraftCreateRouter } from "./routers/v3/minecraft-servers/create";
import { NotFoundError } from "./lib/exceptions/not-found-error";
import { minecraftStartRouter } from "./routers/v3/minecraft-servers/start";

const app = express();
const server = createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
  },
});

const docker = new DockerService(process.env.CONTAINERS_DIR!, new SocketIO(io));

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
  // minecraftGetOneRouter,
  // minecraftGetAllRouter,
  minecraftCreateRouter,
  // minecraftUpdateRouter,
  // minecraftDeleteRouter,
  minecraftStartRouter,
  // minecraftStopRouter,
  // minecraftRestartRouter,
]);

app.all("*", async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { server, docker };
