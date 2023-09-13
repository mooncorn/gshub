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
import { ConsoleCommand } from './console-command';

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
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const textareaRef = useRef(null);

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
  }, [game]);

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
          {executeCommand && (
            <ConsoleCommand
              isOnline={isOnline}
              executeCommand={executeCommand}
            />
          )}
        </div>
      )}
    </div>
  );
}
