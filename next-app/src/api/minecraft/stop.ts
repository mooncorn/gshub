import { base } from '..';

export async function stop() {
  return await base.post('/minecraft/stop');
}
