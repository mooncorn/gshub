import { base } from '..';

export async function cmd(cmd: string) {
  return await base.post('/minecraft/cmd', { cmd });
}
