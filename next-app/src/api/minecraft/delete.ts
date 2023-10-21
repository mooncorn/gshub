import { base } from '..';

export async function deleteServer({ id }: { id: string }) {
  return await base.delete(`/minecraft/servers/${id}`);
}
