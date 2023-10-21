import { base } from '..';

export async function restart({ id }: { id: string }) {
  return await base.post(`/minecraft/servers/${id}/restart`);
}
