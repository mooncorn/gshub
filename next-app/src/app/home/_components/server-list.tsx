'use client';

import { ServerListItem } from '@/app/home/_components/server-list-item';
import Link from 'next/link';
import { useState } from 'react';
import { status as fetchMinecraftStatus } from '@/api/minecraft';
import { status as fetchValheimStatus } from '@/api/valheim';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from '@/components/spinner';

export function ServerList() {
  const [minecraftStatus, setMinecraftStatus] = useState(false);
  const [valheimStatus, setValheimStatus] = useState(false);

  const minecraftStatusQuery = useQuery({
    queryKey: ['minecraft-status'],
    queryFn: fetchMinecraftStatus,
    onSuccess: ({ status }) => setMinecraftStatus(status === 'online'),
  });

  const valheimStatusQuery = useQuery({
    queryKey: ['valheim-status'],
    queryFn: fetchValheimStatus,
    onSuccess: ({ status }) => setValheimStatus(status === 'online'),
  });

  return (
    <div className="flex flex-col gap-2">
      {minecraftStatusQuery.isLoading ? (
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

      {valheimStatusQuery.isLoading ? (
        <div className="mx-auto w-1 mt-3">
          <Spinner />
        </div>
      ) : (
        <Link href={'/valheim'}>
          <ServerListItem
            name="Valheim"
            status={valheimStatus}
            setStatus={setValheimStatus}
          />
        </Link>
      )}
    </div>
  );
}
