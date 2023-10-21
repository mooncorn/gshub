import { base } from '..';

export async function create({
  name,
  version,
  type,
}: {
  name: string;
  version?: string;
  type?: string;
}) {
  return await base.post('/minecraft/servers', { name, version, type });
}
