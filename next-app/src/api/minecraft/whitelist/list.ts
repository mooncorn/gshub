import { base } from '@/api/base';

export interface Whitelist {
  whitelist: WhitelistUser[];
}

export interface WhitelistUser {
  uuid: string;
  name: string;
}

export default async function whitelistGet({
  id,
}: {
  id: string;
}): Promise<Whitelist> {
  const res = await base.get(`/minecraft/servers/${id}/whitelist`);
  return res.data;
}
