import { GetConsoleData, base } from '..';

export async function console(): Promise<GetConsoleData> {
  const res = await base.get('/minecraft/console');
  return res.data;
}
