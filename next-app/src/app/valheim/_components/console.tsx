'use client';

import { console as fetchConsole } from '@/api/valheim';
import { Spinner } from '@/components/spinner';
import { Textarea } from '@/components/ui/textarea';
import { socket } from '@/lib/socket';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

export function Console() {
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const textareaRef = useRef(null);

  const consoleQuery = useQuery({
    queryKey: ['consoleLogs'],
    queryFn: fetchConsole,
    onSuccess: (data) => {
      setConsoleLogs([data.console]);
    },
  });

  useEffect(() => {
    socket.connect();

    socket.on(`valheim/consoleOutput`, (data) =>
      setConsoleLogs((prev) => [...prev, data])
    );

    return () => {
      socket.off(`valheim/consoleOutput`);
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
        </div>
      )}
    </div>
  );
}
