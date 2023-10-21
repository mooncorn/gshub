import { GetConsoleData, base } from '..';

export async function console({ id }: { id: string }): Promise<GetConsoleData> {
  const res = await base.get(`/minecraft/servers/${id}/console`);
  return res.data;
}
