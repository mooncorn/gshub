import { base } from '../base';

export interface FileData {
  name: string;
  isFile: boolean;
  isDirectory: boolean;
  size: number;
  lastModified: string;
}

export interface GetFilesData {
  files: FileData[];
}

export async function getFiles({
  game,
  path,
}: {
  game: string;
  path: string;
}): Promise<GetFilesData> {
  const res = await base.get(`/${game}/file-explorer?path=${path}`);
  return res.data;
}
