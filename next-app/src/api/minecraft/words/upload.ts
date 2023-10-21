import { base } from '@/api/base';

export default async function uploadWorld({
  id,
  world,
}: {
  id: string;
  world: File;
}) {
  var formData = new FormData();
  formData.append('world', world);

  await base.post(`/minecraft/servers/${id}/world`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}
