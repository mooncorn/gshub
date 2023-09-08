'use client';

import { Badge } from '@/components/ui/badge';
import { useEffect } from 'react';
import { socket } from '@/lib/socket';

interface ServerStatusProps {
  name: string;
  status: boolean;
  setStatus: (status: boolean) => void;
}

export function ServerStatus({ name, status, setStatus }: ServerStatusProps) {
  useEffect(() => {
    socket.connect();

    const lowerCaseName = name.toLowerCase();

    socket.on(`${lowerCaseName}/started`, () => setStatus(true));
    socket.on(`${lowerCaseName}/stopped`, () => setStatus(false));

    return () => {
      socket.off(`${lowerCaseName}/started`);
      socket.off(`${lowerCaseName}/stopped`);
    };
  }, []);

  return (
    <Badge style={{ backgroundColor: status ? 'green' : 'red' }}>
      {status ? 'Online' : 'Offline'}
    </Badge>
  );
}
