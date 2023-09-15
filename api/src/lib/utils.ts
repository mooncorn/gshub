import path from 'path';
import { docker } from './docker';

export async function getContainerInfo(name: string, all: boolean = true) {
  const containers = await docker.listContainers({ all });
  return containers.find((container) => container.Names.includes(`/${name}`));
}

export function mapToGameDirectory(gameName: string): string {
  return path.join(
    process.cwd(),
    `../gameservers/${gameName.trim().toLowerCase()}`
  );
}
