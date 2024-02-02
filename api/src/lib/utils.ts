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

export function getPathSegments(path: string, segments: number): string {
  const pathArray = path.split("/").filter((segment) => segment !== ""); // Split the path and remove empty segments

  if (segments >= 0) {
    return "/" + pathArray.slice(0, segments).join("/");
  } else {
    return "/" + pathArray.slice(segments).join("/");
  }
}

export function getPublicVolumeBinds(
  volumeBinds: string[] | undefined
): string[] {
  if (volumeBinds === undefined || volumeBinds.length === 0) return [];

  const containersDir = path.normalize(env.CONTAINERS_DIR);
  const lastIndex = containersDir.lastIndexOf("\\");
  const containersDirName = containersDir.slice(lastIndex + 1);

  return volumeBinds.map((bind) =>
    bind
      .slice(bind.indexOf(containersDirName) + containersDirName.length)
      .replaceAll("\\", "/")
  );
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
