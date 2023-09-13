import { GetConsoleData, base } from '..';

export async function console(): Promise<GetConsoleData> {
  const res = await base.get('/valheim/console');
  return res.data;
}
