'use client';

import { cmd, console as fetchConsole } from '@/api/minecraft';
import { Spinner } from '@/components/spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { socket } from '@/lib/socket';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

export function Console({ isOnline }: { isOnline: boolean }) {
  const [command, setCommand] = useState<string>('');
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const textareaRef = useRef(null);

  const cmdMutation = useMutation({
    mutationFn: (command: string) => cmd(command),
    onSuccess: () => setCommand(''),
  });

  const consoleQuery = useQuery({
    queryKey: ['consoleLogs'],
    queryFn: fetchConsole,
    onSuccess: (data) => {
      setConsoleLogs([data.console]);
    },
  });

  useEffect(() => {
    socket.connect();

    socket.on(`minecraft/consoleOutput`, (data) =>
      setConsoleLogs((prev) => [...prev, data])
    );

    return () => {
      socket.off(`minecraft/consoleOutput`);
    };
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      const area = textareaRef.current as HTMLTextAreaElement;
      area.scrollTop = area.scrollHeight;
    }
  });

  return (
    <div>
      {consoleQuery.isLoading ? (
        <div className="mx-auto w-1 mt-3">
          <Spinner />
        </div>
      ) : (
        <div>
          <Textarea
            ref={textareaRef}
            readOnly={true}
            className="h-[300px]"
            value={consoleLogs.join('')}
          />
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
        </div>
      )}
    </div>
  );
}
