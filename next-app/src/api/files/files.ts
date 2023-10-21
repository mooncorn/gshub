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
  id,
  game,
  path,
}: {
  id: string;
  game: string;
  path: string;
}): Promise<GetFilesData> {
  const res = await base.get(`/${game}/servers/${id}/files?path=${path}`);
  return res.data;
}
