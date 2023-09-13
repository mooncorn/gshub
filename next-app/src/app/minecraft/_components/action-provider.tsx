'use client';

import { Dashboard } from '@/components/dashboard';
import {
  console as fetchConsole,
  status as fetchStatus,
  cmd as executeCommand,
  start,
  stop,
  restart,
} from '../../../api/minecraft';

interface ActionProviderProps extends React.HTMLAttributes<HTMLElement> {}

export function ActionProvider() {
  return (
    <Dashboard
      game="minecraft"
      fetchConsole={fetchConsole}
      fetchStatus={fetchStatus}
      executeCommand={executeCommand}
      start={start}
      stop={stop}
      restart={restart}
    />
  );
}
