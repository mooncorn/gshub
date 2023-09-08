import path from 'path';
import { LevelType } from './minecraft-server';

export function isOfTypeLevelType(value: string): value is LevelType {
  return [
    'normal',
    'flat',
    'large_biomes',
    'amplified',
    'single_biome_surface',
  ].includes(value);
}

export function mapToGameDirectory(gameName: string): string {
  return path.join(
    process.cwd(),
    `../gameservers/${gameName.trim().toLocaleLowerCase()}`
  );
}
