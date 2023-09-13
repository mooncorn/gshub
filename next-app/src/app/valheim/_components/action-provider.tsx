'use client';

import { Dashboard } from '@/components/dashboard';
import {
  console as fetchConsole,
  status as fetchStatus,
  start,
  stop,
  restart,
} from '../../../api/valheim';

export function ActionProvider() {
  return (
    <Dashboard
      game="valheim"
      fetchConsole={fetchConsole}
      fetchStatus={fetchStatus}
      start={start}
      stop={stop}
      restart={restart}
    />
  );
}
