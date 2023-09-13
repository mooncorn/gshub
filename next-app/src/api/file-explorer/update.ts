import { base } from '../base';

export async function updateFile({
  game,
  path,
  content,
}: {
  path: string;
  game: string;
  content: string;
}) {
  return await base.put(`/${game}/file-explorer/file?path=${path}`, {
    content,
  });
}
