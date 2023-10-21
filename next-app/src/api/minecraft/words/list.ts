import { base } from '@/api/base';

export interface WorldsResponseData {
  worlds: World[];
}

export interface World {
  name: string;
  active: boolean;
}

export default async function getWorlds({
  id,
}: {
  id: string;
}): Promise<WorldsResponseData> {
  const res = await base.get(`/minecraft/servers/${id}/world`);
  return res.data;
}
