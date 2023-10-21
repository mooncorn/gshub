import { base } from '..';

export async function stop({ id }: { id: string }) {
  return await base.post(`/minecraft/servers/${id}/stop`);
}
