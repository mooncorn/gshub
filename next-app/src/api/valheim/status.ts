import { base } from '..';
import { GetStatusData } from '..';

export async function status(): Promise<GetStatusData> {
  const res = await base.get('/valheim/status');
  return res.data;
}
