'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMutation } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { useState } from 'react';

interface ConsoleCommandProps {
  isOnline: boolean;
  executeCommand: (cmd: string) => Promise<AxiosResponse<any, any>>;
}

export function ConsoleCommand({
  isOnline,
  executeCommand,
}: ConsoleCommandProps) {
  const [command, setCommand] = useState<string>('');

  const cmdMutation = useMutation({
    mutationFn: (command: string) => executeCommand(command),
    onSuccess: () => setCommand(''),
  });

  return (
    <div className="flex my-2 gap-x-2">
      <Input
        type="text"
        placeholder="Enter command here..."
        value={command}
        onChange={(e) => setCommand(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.code === 'Enter') cmdMutation.mutate(command);
        }}
      />
      <Button
        disabled={!isOnline}
        variant={'outline'}
        onClick={() => cmdMutation.mutate(command)}
      >
        Execute
      </Button>
    </div>
  );
}
