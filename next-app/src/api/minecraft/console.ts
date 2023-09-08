import { base } from '..';

interface GetConsoleData {
  console: string;
}

export async function console(): Promise<GetConsoleData> {
  const res = await base.get('/minecraft/console');
  return res.data;
}
