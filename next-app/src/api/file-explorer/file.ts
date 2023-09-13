import { base } from '../base';

export interface GetFileContentData {
  content: string;
}

export async function getFileContent({
  game,
  path,
}: {
  game: string;
  path: string;
}): Promise<GetFileContentData> {
  const res = await base.get(`/${game}/file-explorer/file?path=${path}`);
  return res.data;
}
