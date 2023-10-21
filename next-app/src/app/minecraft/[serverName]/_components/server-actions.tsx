'use client';

import { restart, stop, start } from '@/api/minecraft';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';

interface ServerActionsProps {
  isOnline: boolean;
  id: string;
}

export function ServerActions({ isOnline, id }: ServerActionsProps) {
  const startMutation = useMutation({
    mutationKey: ['startServer'],
    mutationFn: start,
    cacheTime: 0,
  });

  const stopMutation = useMutation({
    mutationKey: ['startServer'],
    mutationFn: stop,
    cacheTime: 0,
  });

  const restartMutation = useMutation(restart);

  return (
    <div className="flex gap-x-2">
      <Button
        style={{ backgroundColor: 'green' }}
        disabled={
          isOnline ||
          startMutation.isLoading ||
          stopMutation.isLoading ||
          restartMutation.isLoading
        }
        onClick={() => startMutation.mutate({ id })}
      >
        Start
      </Button>
      <Button
        variant={'destructive'}
        disabled={
          !isOnline ||
          startMutation.isLoading ||
          stopMutation.isLoading ||
          restartMutation.isLoading
        }
        onClick={() => stopMutation.mutate({ id })}
      >
        Stop
      </Button>
      <Button
        style={{ backgroundColor: 'orange' }}
        disabled={
          !isOnline ||
          startMutation.isLoading ||
          stopMutation.isLoading ||
          restartMutation.isLoading
        }
        onClick={() => restartMutation.mutate({ id })}
      >
        Restart
      </Button>
    </div>
  );
}
