import { base } from '../base';

export interface GetFileContentData {
  content: string;
}

export async function getFileContent({
  id,
  game,
  path,
}: {
  id: string;
  game: string;
  path: string;
}): Promise<GetFileContentData> {
  const res = await base.get(
    `/${game}/servers/${id}/files/content?path=${path}`
  );
  return res.data;
}
