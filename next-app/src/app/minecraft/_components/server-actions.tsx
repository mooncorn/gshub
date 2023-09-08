'use client';

import { useMutation } from '@tanstack/react-query';
import { Button } from '../../../components/ui/button';
import { restart, start, stop } from '@/api/minecraft';

interface ServerActionsProps {
  isOnline: boolean;
}

export function ServerActions({ isOnline }: ServerActionsProps) {
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
