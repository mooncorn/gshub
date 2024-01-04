// import { exec } from "child_process";
// import { BadRequestError } from "../exceptions/bad-request-error";
// import fs from "fs/promises";
// import path from "path";
// import AdmZip from "adm-zip";
import { IDockerContainer } from "./docker-container";
import { Identifiable } from "./collection";
import { IServerConsoleOutputEmitter } from "./server-console-output-emitter";
import { IServerStatusChangedEmitter } from "./server-status-changed-emitter";

export interface IServerActions {
  start(): Promise<void>;
  stop(): Promise<void>;
  restart(): Promise<void>;
}

export interface IServer extends Identifiable<string>, IServerActions {
  name: string;
  image: string;
  running: boolean;
  env: Record<string, string>;
}

export class MinecraftServer implements IServer {
  constructor(
    private container: IDockerContainer,
    private consoleOutput: IServerConsoleOutputEmitter,
    private statusChanged: IServerStatusChangedEmitter
  ) {}

  public get id() {
    return this.container.id;
  }

  public get name() {
    return this.container.name;
  }

  public get image() {
    return this.container.image;
  }

  public get running() {
    return this.container.running;
  }

  public get env() {
    return this.container.env;
  }

  public start = async () => await this.container.start();

  public stop = async () => await this.container.stop();

  public restart = async () => await this.container.restart();
}

// export class MinecraftServerDepracated extends GameServer {
//   public playerCount: number;

//   constructor(opts: GameServerOptions) {
//     super(opts);
//     // There might be an issue where the server is restarted
//     // while a minecraft server is online with players on it.
//     // Player count will be zero while players are connected.
//     this.playerCount = 0;

//     opts.container.removeAllListeners(DockerContainer.CONSOLE_OUTPUT_EVENT);

//     opts.container.on(DockerContainer.CONSOLE_OUTPUT_EVENT, (chunk) => {
//       const cleanChunk: string = chunk.toString().slice(8, chunk.length);
//       this.io.emit(
//         `${this.container.name}/${DockerContainer.CONSOLE_OUTPUT_EVENT}`,
//         cleanChunk
//       );
//     });

//     this.container.on(DockerContainer.CONSOLE_OUTPUT_EVENT, (data) => {
//       if (data.includes("joined the game")) {
//         this.playerCount++;
//         this.io.emit(`${this.container.name}/playerJoined`);
//       } else if (data.includes("left the game")) {
//         this.playerCount = Math.max(0, this.playerCount - 1);
//         this.io.emit(`${this.container.name}/playerLeft`);
//       }
//     });

//     this.container.on(DockerContainer.CONSOLE_OUTPUT_EVENT, (data) => {
//       if (data.includes('For help, type "help"')) {
//         this.io.emit(`${this.container.name}/ready`);
//       }
//     });
//   }

//   public executeCommand(cmd: string): Promise<string> {
//     if (!this.container.running)
//       throw new BadRequestError(
//         "Server has to be online to execute this operation"
//       );

//     return new Promise((resolve, reject) => {
//       exec(
//         `docker exec ${this.container.name} rcon-cli ${cmd}`,
//         (err, stdout) => {
//           console.log(stdout);
//           if (err) {
//             reject(err);
//           }
//           resolve(stdout);
//         }
//       );
//     });
//   }

//   public async getWorlds() {
//     const files = await fs.readdir(this.sourceDirectory);

//     const isDefaultWorld = (name: string) => name === "world";
//     const isNotSpecialWorld = (name: string) =>
//       !name.includes("the_end") && !name.includes("nether");

//     const uniqueOverWorlds = [
//       ...new Set([
//         ...files.filter(isDefaultWorld),
//         ...files
//           .filter((name) => name.startsWith("world-"))
//           .map((name) => name.replace("world-", "")),
//       ]),
//     ].filter(isNotSpecialWorld);

//     let buffer: Buffer;

//     try {
//       buffer = await fs.readFile(
//         path.join(this.sourceDirectory, "server.properties")
//       );
//     } catch (e) {
//       console.log(e);
//       throw new BadRequestError(
//         "Properties file does not exist. Try starting the server to generate the files."
//       );
//     }

//     const properties = buffer.toString();
//     const activeWorldName = properties.match("level-name=.+")![0].split("=")[1];

//     const filteredActiveWorldName =
//       activeWorldName === "world"
//         ? "world"
//         : activeWorldName.replace("world-", "");

//     const worlds = uniqueOverWorlds.map((name) => ({
//       name,
//       active: filteredActiveWorldName === name,
//     }));

//     return worlds;
//   }

//   public async setActiveWorld(name: string) {
//     const worlds = await this.getWorlds();

//     const cleanName = name.trim().toLowerCase().replace(" ", "-");

//     const found = worlds.find((w) => w.name === cleanName);

//     if (!found)
//       throw new BadRequestError("World with this name does not exist");

//     if (found.active) throw new BadRequestError("World is already active");

//     const propertiesPath = path.join(this.sourceDirectory, "server.properties");
//     let buffer: Buffer;

//     try {
//       buffer = await fs.readFile(propertiesPath);
//     } catch (e) {
//       console.log(e);
//       throw new BadRequestError(
//         "Properties file does not exist. Try starting the server to generate the files."
//       );
//     }

//     const properties = buffer.toString();

//     let updatedProperties = "";

//     for (let line of properties.split("\n")) {
//       if (line.includes("level-name")) {
//         const levelName =
//           cleanName === "world" ? "world" : "world-" + cleanName;
//         updatedProperties += "level-name=" + levelName + "\n";
//       } else {
//         updatedProperties += line + "\n";
//       }
//     }

//     await fs.writeFile(propertiesPath, updatedProperties);
//   }

//   public async uploadWorld(world: Buffer | undefined) {
//     if (!world) throw new BadRequestError("World buffer is undefined");

//     if (!this.container.running)
//       throw new BadRequestError("Server has to be stopped to upload a world");

//     // unzip
//     const zip = new AdmZip(world);
//     const zipEntries = zip.getEntries();

//     // find directory name within the zip
//     let extractedWorldName = null;

//     try {
//       extractedWorldName = zipEntries[0].entryName.split("/")[0];
//     } catch (e) {
//       throw new BadRequestError("No directory found within the zip file");
//     }

//     const worldName = extractedWorldName.trim().toLowerCase().replace(" ", "-");

//     const tempPath = path.join(this.sourceDirectory, "temp");
//     const worldPath = path.join(this.sourceDirectory, "world-" + worldName);

//     // do the magic
//     await fs.mkdir(tempPath, { recursive: true });
//     await fs.rm(worldPath, { recursive: true, force: true });
//     zip.extractAllTo(tempPath, true);
//     await fs.cp(path.join(tempPath, extractedWorldName), worldPath, {
//       recursive: true,
//     });
//     await fs.rm(tempPath, { recursive: true, force: true });
//   }

//   public async getLogs(limit: number): Promise<string | undefined> {
//     const logs = await this.container.getLogs(limit);
//     return logs
//       ?.split("\n")
//       .map((item) => item.slice(8, item.length))
//       .join("\n");
//   }
// }
