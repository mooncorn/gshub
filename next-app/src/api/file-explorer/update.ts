import { base } from '../base';

export async function updateFile(path: string, content: string) {
  return await base.put(`/minecraft/file-explorer/file?path=${path}`, {
    content,
  });
}
