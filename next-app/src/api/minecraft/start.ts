import { base } from '..';

export async function start() {
  return await base.post('/minecraft/start');
}
