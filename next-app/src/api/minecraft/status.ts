import { base } from '..';

export interface GetStatusData {
  status: 'offline' | 'online';
}

export async function status(): Promise<GetStatusData> {
  const res = await base.get('/minecraft/status');
  return res.data;
}
