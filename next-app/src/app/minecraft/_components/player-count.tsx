'use client';

import { ServerListItem } from '@/api/minecraft';
import { fetchPlayerCount } from '@/api/minecraft/players';
import { socket } from '@/lib/socket';
import { useQuery } from '@tanstack/react-query';
import { User } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function PlayerCount({
  serverItem,
}: {
  serverItem: ServerListItem;
}) {
  const [playerCount, setPlayerCount] = useState<number>(0);

  useEffect(() => {
    socket.connect();

    socket.on(`${serverItem.name}/playerJoined`, () => {
      setPlayerCount((prev) => prev + 1);
    });

    socket.on(`${serverItem.name}/playerLeft`, () => {
      setPlayerCount((prev) => prev - 1);
    });

    return () => {
      socket.off(`${serverItem.name}/playerJoined`);
      socket.off(`${serverItem.name}/playerLeft`);
    };
  }, []);

  const playerCountQuery = useQuery({
    queryFn: () => fetchPlayerCount({ id: serverItem.id }),
    onSuccess: (data) => setPlayerCount(data.status.players),
    enabled: serverItem.status === 'online',
  });

  return (
    <div className="flex gap-x-1 items-center">
      <User size={18} />
      {playerCount}
    </div>
  );
}
