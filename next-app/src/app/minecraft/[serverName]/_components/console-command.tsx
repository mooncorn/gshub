'use client';

import { ServerListItem } from '@/api/minecraft';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useState } from 'react';
import { cmd as executeCommand } from '@/api/minecraft';
import { toast } from '@/components/ui/use-toast';

interface ConsoleCommandProps {
  serverItem: ServerListItem;
}

export function ConsoleCommand({ serverItem }: ConsoleCommandProps) {
  const [command, setCommand] = useState<string>('');

  const cmdMutation = useMutation({
    mutationFn: executeCommand,
    onSuccess: (data) => {
      setCommand('');
      toast({
        description: data.message,
        variant: 'default',
      });
    },
    onError: (err) => {
      if (err instanceof AxiosError)
        toast({
          title: 'Error',
          description: err.response?.data.errors[0].message,
          variant: 'destructive',
        });
    },
  });

  return (
    <div className="flex my-2 gap-x-2">
      <Input
        type="text"
        placeholder="Enter command here..."
        value={command}
        onChange={(e) => setCommand(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.code === 'Enter')
            cmdMutation.mutate({ id: serverItem.id, cmd: command });
        }}
      />
      <Button
        disabled={serverItem.status === 'online' ? false : true}
        variant={'outline'}
        onClick={() => cmdMutation.mutate({ id: serverItem.id, cmd: command })}
      >
        Execute
      </Button>
    </div>
  );
}
