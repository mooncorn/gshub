import { base } from '@/api/base';

export default async function whitelistRemove({
  id,
  username,
}: {
  id: string;
  username: string;
}) {
  return await base.delete(`/minecraft/servers/${id}/whitelist`, {
    data: { username },
  });
}
