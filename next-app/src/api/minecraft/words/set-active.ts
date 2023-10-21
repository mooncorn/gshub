import { base } from '@/api/base';

export default async function activateWorld({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  await base.post(`/minecraft/servers/${id}/world/activate`, {
    name,
  });
}
