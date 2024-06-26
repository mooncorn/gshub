import "express-async-errors";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server as SocketServer } from "socket.io";
import { createServer } from "./lib/http-server";
import { errorHandler } from "./middleware/error-handler";
import { DockerService } from "./lib/docker/docker-service";
import { SocketIO } from "./lib/socket-io";
import { NotFoundError } from "./lib/exceptions/not-found-error";
import { env } from "./lib/env";
import { filesListRouter } from "./routers/files/list";
import { serversGetAllRouter } from "./routers/servers/get-all";
import { volumesListRouter } from "./routers/volumes/list";
import { serversCreateRouter } from "./routers/servers/create";
import { serversDeleteRouter } from "./routers/servers/delete";
import { serversGetOneRouter } from "./routers/servers/get-one";
import { serversStartRouter } from "./routers/servers/start";
import { serversStopRouter } from "./routers/servers/stop";
import { serversRestartRouter } from "./routers/servers/restart";
import { serversGetLogsRouter } from "./routers/servers/get-logs";

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
  serversGetAllRouter,
  serversGetOneRouter,
  serversCreateRouter,
  serversDeleteRouter,
  serversStartRouter,
  serversStopRouter,
  serversRestartRouter,
  serversGetLogsRouter,
  filesListRouter,

  volumesListRouter,
]);

app.all("*", async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { server, docker };
