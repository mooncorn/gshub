export * from './base';

export interface GetStatusData {
  status: 'offline' | 'online';
}

export interface GetConsoleData {
  console: string;
}
