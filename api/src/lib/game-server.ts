import { ChildProcess, exec } from 'child_process';
import { ServerOnlineError } from './exceptions/server-online-error';
import { mapToGameDirectory } from './utils';
import { Server } from 'socket.io';
import { ServerOfflineError } from './exceptions/server-offline-error';
import { InternalError } from './exceptions/internal-error';

// Enumeration of possible game server statuses.
export enum GameServerStatus {
  OFFLINE = 'offline',
  ONLINE = 'online',
}

/**
 * GameServerOptions interface
 * - io (optional): A socket.io server instance to emit events.
 * - gameName: The name of the game for which the server is being managed.
 * - startCommand: The command to initiate the game server process.
 */
interface GameServerOptions {
  io?: Server;
  gameName: string;
  startCommand: string;
}

/**
 * GameServer class
 * provides methods for managing a game server process.
 */
export class GameServer {
  protected server?: ChildProcess;
  protected opts: GameServerOptions;

  /* Constants */
  protected readonly START_SERVER_COMMAND: string;
  protected readonly SERVER_DIR: string;

  /* Events */
  protected readonly OUTPUT_EVENT: string;
  protected readonly STATUS_CHANGED_EVENT: string;

  constructor(opts: GameServerOptions) {
    this.opts = opts;
    this.START_SERVER_COMMAND = opts.startCommand;
    this.SERVER_DIR = mapToGameDirectory(opts.gameName);
    this.OUTPUT_EVENT = `${opts.gameName}/consoleOutput`;
    this.STATUS_CHANGED_EVENT = `${opts.gameName}/statusChanged`;
  }

  /**
   * Get the current status of the game server.
   * @returns {GameServerStatus} - The current status (ONLINE or OFFLINE).
   */
  public getStatus(): GameServerStatus {
    return this.server ? GameServerStatus.ONLINE : GameServerStatus.OFFLINE;
  }

  /**
   * Start the game server process.
   * Throws an error if the server is already online.
   */
  public start(): void {
    if (this.server) throw new ServerOnlineError();

    const options = { cwd: this.SERVER_DIR };

    // Initiate server startup
    this.server = exec(
      this.START_SERVER_COMMAND,
      options,
      this.handleExecError
    );

    this.attachEventListeners();

    this.opts.io?.emit(this.STATUS_CHANGED_EVENT, GameServerStatus.ONLINE);

    console.log(this.SERVER_DIR, this.START_SERVER_COMMAND, this.OUTPUT_EVENT);
  }

  protected handleExecError = (error: Error | null): void => {
    if (error) {
      console.error(`exec error: ${error}`);
      this.kill();
    }
  };

  /**
   * Stop the game server process.
   * Returns a promise that resolves once the server process has stopped.
   * Throws an error if the server is not online.
   */
  public stop(): Promise<void> {
    if (!this.server) throw new ServerOfflineError();

    this.initiateGracefulShutdown();

    return new Promise((resolve, _) => {
      this.server?.on('close', () => {
        this.setServerOffline();
        resolve();
      });
    });
  }

  /**
   * Forcefully kill the game server process.
   */
  public kill() {
    const killed = this.server?.kill('SIGTERM');

    this.server?.on('close', (_, signal) => {
      console.log(
        `child process terminated due to receipt of signal ${signal}`
      );
    });
  }

  /**
   * Restart the game server.
   * Stops the server (if online) and starts it again.
   */
  public async restart(): Promise<void> {
    try {
      await this.stop();
    } catch (err) {
      if (!(err instanceof ServerOfflineError)) throw err;
    }
    this.start();
  }

  /**
   * Handle data events from the game server's stdout.
   * Can be overridden to provide custom behavior.
   */
  protected onServerOutput(data: any): void {}

  /**
   * Handle error events from the game server's stderr.
   * Can be overridden to provide custom behavior.
   */
  protected onServerError(data: any): void {}

  /**
   * Initiate a graceful shutdown of the game server.
   * Can be overridden to provide custom shutdown behavior.
   */
  protected initiateGracefulShutdown(): void {}

  /**
   * Attach event listeners to the game server process.
   */
  protected attachEventListeners() {
    if (!this.server)
      throw new InternalError('Cannot attach events to an offline server');

    this.server.on('exit', (code) => {
      console.log(code);
      if (code !== 0) {
        // If the exit code isn't 0, something went wrong
        this.setServerOffline();
      }
    });

    this.server.stdout?.on('data', (data) => {
      this.opts.io?.emit(this.OUTPUT_EVENT, data.toString());
      this.onServerOutput(data);
    });

    this.server.stderr?.on('data', (data) => {
      this.opts.io?.emit(this.OUTPUT_EVENT, data.toString());
      this.onServerError(data);
    });
  }

  protected setServerOffline() {
    this.server = undefined;
    this.opts.io?.emit(this.STATUS_CHANGED_EVENT, GameServerStatus.OFFLINE);
  }
}
