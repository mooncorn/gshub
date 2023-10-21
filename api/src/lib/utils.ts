import path from 'path';
import { docker } from './docker';

export async function getContainerInfo(name: string, all: boolean = true) {
  const containers = await docker.listContainers({ all });
  return containers.find((container) => container.Names.includes(name));
}

export function mapToGameDirectory(gameName: string): string {
  return path.join(
    process.cwd(),
    `../gameservers/${gameName.trim().toLowerCase()}`
  );
}

export function getFormattedTime() {
  return new Date()
    .toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    .toUpperCase();
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
