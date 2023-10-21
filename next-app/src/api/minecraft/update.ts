import { base } from '..';

export async function update({
  id,
  version,
  type,
}: {
  id: string;
  version?: string;
  type?: string;
}) {
  return await base.put(`/minecraft/servers/${id}`, { name, version, type });
}
