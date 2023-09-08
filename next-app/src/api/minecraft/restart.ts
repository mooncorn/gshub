import { base } from '..';

export async function restart() {
  return await base.post('/minecraft/restart');
}
