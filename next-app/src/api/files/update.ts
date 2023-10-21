import { base } from '../base';

export async function updateFile({
  id,
  game,
  path,
  content,
}: {
  id: string;
  path: string;
  game: string;
  content: string;
}) {
  return await base.put(`/${game}/servers/${id}/files?path=${path}`, {
    content,
  });
}
