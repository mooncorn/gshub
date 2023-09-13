'use client';

import { useMutation } from '@tanstack/react-query';
import { Button } from './ui/button';
import { AxiosResponse } from 'axios';

interface ServerActionsProps {
  isOnline: boolean;
  start: () => Promise<AxiosResponse<any, any>>;
  stop: () => Promise<AxiosResponse<any, any>>;
  restart: () => Promise<AxiosResponse<any, any>>;
}

export function ServerActions({
  isOnline,
  start,
  stop,
  restart,
}: ServerActionsProps) {
  const startMutation = useMutation(start);

  const stopMutation = useMutation(stop);

  const restartMutation = useMutation(restart);

  return (
    <div className="flex gap-x-2">
      <Button
        style={{ backgroundColor: 'green' }}
        disabled={isOnline}
        onClick={() => startMutation.mutate()}
      >
        Start
      </Button>
      <Button
        variant={'destructive'}
        disabled={!isOnline}
        onClick={() => stopMutation.mutate()}
      >
        Stop
      </Button>
      <Button
        style={{ backgroundColor: 'orange' }}
        disabled={!isOnline}
        onClick={() => restartMutation.mutate()}
      >
        Restart
      </Button>
    </div>
  );
}
