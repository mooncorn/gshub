import { ChildProcess, exec } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { Server } from 'socket.io';
import { ServerOfflineError } from './exceptions/server-offline-error';
import { ServerOnlineError } from './exceptions/server-online-error';
import { mapToGameDirectory } from './utils';

const NAME = 'minecraft';
const MINECRAFT_SERVER_DIR = mapToGameDirectory(NAME);
const MINECRAFT_CONSOLE_OUTPUT_EVENT = 'minecraft/consoleOutput';
const MINECRAFT_STARTED_EVENT = 'minecraft/started';
const MINECRAFT_STOPPED_EVENT = 'minecraft/stopped';

const MINECRAFT_CONSOLE_LOGS_PATH = path.join(
  process.cwd(),
  '../gameservers/minecraft/logs/latest.log'
);

export type LevelType =
  | 'normal'
  | 'flat'
  | 'large_biomes'
  | 'amplified'
  | 'single_biome_surface';

interface EditableProperties {
  name: string;
  seed?: string;
  type?: LevelType;
  generateStructures?: boolean;
}

export class MinecraftServer {
  private _process?: ChildProcess;

  constructor(private _io: Server) {}

  public get process(): ChildProcess | undefined {
    return this._process;
  }

  public start(): void {
    if (this._process) throw new ServerOnlineError();

    const minecraftStartCommand =
      'java -Xmx1024M -Xms1024M -jar server.jar nogui';
    const options = { cwd: MINECRAFT_SERVER_DIR };

    // Initiate server startup
    this._process = exec(
      minecraftStartCommand,
      options,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
      }
    );

    this._process.on('error', (err) => {
      console.log('Process error: ', err.message);
      this._process = undefined;
      this._io.emit(MINECRAFT_STOPPED_EVENT);
    });

    this._process.on('exit', (code) => {
      if (code !== 0) {
        // If the exit code isn't 0, something went wrong
        this._process = undefined;
        this._io.emit(MINECRAFT_STOPPED_EVENT);
      }
    });

    // this._process.on('close', () => {
    //   this._process = undefined; // Reset the reference to the process
    //   this._io.emit(MINECRAFT_STOPPED_EVENT);
    // });

    this._io.emit(MINECRAFT_STARTED_EVENT);

    this._process.stdout?.on('data', (data) => {
      // Emit console output to Socket.io clients
      this._io.emit(MINECRAFT_CONSOLE_OUTPUT_EVENT, data.toString());
    });
  }

  public stop(): Promise<void> {
    if (!this._process) throw new ServerOfflineError();

    this._process.stdin?.write('stop\n'); // Send the "stop" command

    return new Promise((resolve, _) => {
      this._process?.on('close', () => {
        this._io.emit(MINECRAFT_STOPPED_EVENT);
        this._process = undefined; // Reset the reference to the process
        resolve();
      });
    });
  }

  public execute(cmd: string): void {
    if (!this._process) throw new ServerOfflineError();

    this._io.emit(
      MINECRAFT_CONSOLE_OUTPUT_EVENT,
      `Executing command: ${cmd}\n`
    );

    this._process.stdin?.write(`${cmd}\n`);
  }

  public async getLogs(): Promise<string | undefined> {
    try {
      return await fs.readFile(MINECRAFT_CONSOLE_LOGS_PATH, 'utf-8');
    } catch (err) {
      console.log(err);
      return undefined;
    }
  }

  public async restart(): Promise<void> {
    try {
      await this.stop();
    } catch (err) {
      if (!(err instanceof ServerOfflineError)) throw err;
    }
    this.start();
  }

  public async edit({
    name,
    seed,
    type,
    generateStructures,
  }: EditableProperties) {
    const propertiesFilePath = path.join(
      MINECRAFT_SERVER_DIR,
      'server.properties'
    );

    let data: string;

    try {
      data = await fs.readFile(propertiesFilePath, 'utf-8');
    } catch (err) {
      throw new Error('Could not read server.properties');
    }

    try {
      // Parse the existing properties
      const existingProperties = data
        .split('\n')
        .reduce((acc: { [key: string]: string }, line) => {
          const [key, value] = line.split('=');
          if (key && value) {
            acc[key.trim()] = value.trim();
          }
          return acc;
        }, {});

      // Update properties with the new values
      existingProperties['level-name'] = `world-${name}`;
      existingProperties['level-type'] = type || '';
      existingProperties['level-seed'] = seed || '';
      existingProperties['generate-structures'] = String(
        generateStructures || true
      );

      // Create a string representation of the updated properties
      const updatedPropertiesString = Object.entries(existingProperties)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

      // Write the updated properties back to the server.properties file
      await fs.writeFile(propertiesFilePath, updatedPropertiesString, 'utf-8');
    } catch (err) {
      console.log(err);
      throw new Error('Error updating server.properties');
    }
  }
}
