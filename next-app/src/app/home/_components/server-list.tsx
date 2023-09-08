'use client';

import { ServerListItem } from '@/app/home/_components/server-list-item';
import Link from 'next/link';
import { useState } from 'react';
import { status as fetchStatus } from '@/api/minecraft';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from '@/components/spinner';

export function ServerList() {
  const [minecraftStatus, setMinecraftStatus] = useState(false);

  const statusQuery = useQuery({
    queryKey: ['status'],
    queryFn: fetchStatus,
    onSuccess: ({ status }) => setMinecraftStatus(status === 'online'),
  });

  return (
    <div className="flex flex-col gap-2">
      {statusQuery.isLoading ? (
        <div className="mx-auto w-1 mt-3">
          <Spinner />
        </div>
      ) : (
        <Link href={'/minecraft'}>
          <ServerListItem
            name="Minecraft"
            status={minecraftStatus}
            setStatus={setMinecraftStatus}
          />
        </Link>
      )}

      {/* <ServerListItem name="Valheim" isOnline={false} /> */}
    </div>
  );
}
