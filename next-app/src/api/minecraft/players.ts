import { base } from '..';

interface FetchPlayerCountResponseData {
  status: PlayerCount;
}

export interface PlayerCount {
  players: number;
  max_players: number;
}

export async function fetchPlayerCount({
  id,
}: {
  id: string;
}): Promise<FetchPlayerCountResponseData> {
  const res = await base.get(`/minecraft/servers/${id}/players`);
  return res.data;
}
