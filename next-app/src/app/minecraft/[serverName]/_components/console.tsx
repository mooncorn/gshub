'use client';

import { Spinner } from '@/components/spinner';
import { Textarea } from '@/components/ui/textarea';
import { socket } from '@/lib/socket';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { ConsoleCommand } from './console-command';
import { ServerListItem, console as fetchConsole } from '@/api/minecraft';

interface ConsoleProps {
  serverItem: ServerListItem;
}

export function Console({ serverItem }: ConsoleProps) {
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const textareaRef = useRef(null);

  const consoleQuery = useQuery({
    queryKey: ['console'],
    queryFn: () => fetchConsole({ id: serverItem.id }),
    onSuccess: (data) => {
      setConsoleLogs([data.console]);
    },
  });

  useEffect(() => {
    socket.connect();

    socket.on(`${serverItem.name}/consoleOutput`, (data) =>
      setConsoleLogs((prev) => [...prev, data])
    );

    return () => {
      socket.off(`${serverItem.name}/consoleOutput`);
    };
  }, [serverItem]);

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
          <ConsoleCommand serverItem={serverItem} />
        </div>
      )}
    </div>
  );
}
