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

    socket.on(`${name}/statusChanged`, (status) => {
      setStatus(status === 'online' ? true : false);
    });

    return () => {
      socket.off(`${name}/statusChanged`);
    };
  }, []);

  return (
    <div className="m-auto">
      <Badge style={{ backgroundColor: status ? 'green' : 'red' }}>
        {status ? 'Online' : 'Offline'}
      </Badge>
    </div>
  );
}
