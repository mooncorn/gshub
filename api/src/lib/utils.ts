import path from "path";
import { env } from "./env";

export function getFormattedTime() {
  return new Date()
    .toLocaleDateString(undefined, {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    .toUpperCase();
}

export function getContainerDir(containerName: string) {
  return path.join(env.CONTAINERS_DIR, containerName);
}

declare global {
  interface String {
    replaceAll(search: string, replace: string): string;
  }
}

String.prototype.replaceAll = function (
  this: string,
  search: string,
  replace: string
) {
  return this.split(search).join(replace);
};
