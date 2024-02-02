import { Callback } from "./docker/docker-service";

export interface IEventEmitter {
  emit<T>(event: string, data: T): void;
  on<T>(event: string, callback: Callback<T>): void;
  off<T>(event: string, callback: Callback<T>): void;
}
