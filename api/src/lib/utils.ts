import path from 'path';

export function mapToGameDirectory(gameName: string): string {
  return path.join(
    process.cwd(),
    `../gameservers/${gameName.trim().toLowerCase()}`
  );
}
