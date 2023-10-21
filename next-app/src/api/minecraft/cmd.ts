import { base } from '@/api/base';

export async function cmd({
  id,
  cmd,
}: {
  id: string;
  cmd: string;
}): Promise<{ message: string }> {
  const res = await base.post(`/minecraft/servers/${id}/cmd`, { cmd });
  return res.data;
}
