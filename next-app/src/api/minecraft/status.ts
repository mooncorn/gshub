import { GetStatusData, base } from '..';

export async function status({ id }: { id: string }): Promise<GetStatusData> {
  const res = await base.get(`/minecraft/servers/${id}/status`);
  return res.data;
}
