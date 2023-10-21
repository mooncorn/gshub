import { base } from '..';

export async function start({ id }: { id: string }) {
  return await base.post(`/minecraft/servers/${id}/start`);
}
