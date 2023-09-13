'use client';

import { Spinner } from '@/components/spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { socket } from '@/lib/socket';
import {
  UseMutationResult,
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { useEffect, useRef, useState } from 'react';

interface ConsoleProps {
  isOnline: boolean;
  game: string;
  fetchConsole: () => Promise<{ console: string }>;
  executeCommand?: (cmd: string) => Promise<AxiosResponse<any, any>>;
}

export function Console({
  isOnline,
  game,
  fetchConsole,
  executeCommand,
}: ConsoleProps) {
  const [command, setCommand] = useState<string>('');
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const textareaRef = useRef(null);

  let cmdMutation:
    | UseMutationResult<AxiosResponse<any, any>, unknown, string, unknown>
    | undefined;

  if (executeCommand) {
    cmdMutation = useMutation({
      mutationFn: (command: string) => executeCommand(command),
      onSuccess: () => setCommand(''),
    });
  }

  const consoleQuery = useQuery({
    queryKey: ['console'],
    queryFn: fetchConsole,
    onSuccess: (data) => {
      setConsoleLogs([data.console]);
    },
  });

  useEffect(() => {
    socket.connect();

    socket.on(`${game}/consoleOutput`, (data) =>
      setConsoleLogs((prev) => [...prev, data])
    );

    return () => {
      socket.off(`${game}/consoleOutput`);
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
          {cmdMutation && (
            <div className="flex my-2 gap-x-2">
              <Input
                type="text"
                placeholder="Enter command here..."
                value={command}
                onChange={(e) => setCommand(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.code === 'Enter') cmdMutation!.mutate(command);
                }}
              />
              <Button
                disabled={!isOnline}
                variant={'outline'}
                onClick={() => cmdMutation!.mutate(command)}
              >
                Execute
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
