import { base } from '..';

interface FetchServerListResponseData {
  servers: ServerListItem[];
}

export interface ServerListItem {
  id: string;
  name: string;
  status: 'offline' | 'online';
}

export async function fetchServerList(): Promise<FetchServerListResponseData> {
  const res = await base.get('/minecraft/servers');
  return res.data;
}
