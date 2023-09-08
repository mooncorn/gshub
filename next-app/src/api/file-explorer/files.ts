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

export async function getFiles(path: string): Promise<GetFilesData> {
  const res = await base.get(`/minecraft/file-explorer?path=${path}`);
  return res.data;
}
