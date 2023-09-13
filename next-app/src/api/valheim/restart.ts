import { base } from '..';

export async function restart() {
  return await base.post('/valheim/restart');
}
