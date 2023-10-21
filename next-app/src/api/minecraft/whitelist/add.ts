import { base } from '@/api/base';

export default async function whitelistAdd({
  id,
  username,
}: {
  id: string;
  username: string;
}): Promise<{ message: string }> {
  const res = await base.post(`/minecraft/servers/${id}/whitelist`, {
    username,
  });
  return res.data;
}
