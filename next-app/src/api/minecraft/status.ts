import { GetStatusData, base } from '..';

export async function status(): Promise<GetStatusData> {
  const res = await base.get('/minecraft/status');
  return res.data;
}
