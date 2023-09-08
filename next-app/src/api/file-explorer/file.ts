import { base } from '../base';

export interface GetFileContentData {
  content: string;
}

export async function getFileContent(
  path: string
): Promise<GetFileContentData> {
  const res = await base.get(`/minecraft/file-explorer/file?path=${path}`);
  return res.data;
}
