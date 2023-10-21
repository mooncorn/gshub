'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ServerListItem, fetchServerList } from '@/api/minecraft';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Console } from './console';
import { ServerActions } from './server-actions';
import { ServerStatus } from '@/components/server-status';
import Whitelist from './whitelist';
import Worlds from './worlds';
import { Settings as SettingsIcon } from 'lucide-react';
import Settings from './settings';
import { FileExplorer } from '@/components/file-explorer/file-exporer';
import { getFiles } from '@/api/files/files';
import { getFileContent } from '@/api/files/file';

interface ServerDashboardProps {
  serverName: string;
}

export default function ServerDashboard({ serverName }: ServerDashboardProps) {
  // null: doesn't exist
  // undefined: not fetched yet
  const [serverItem, setServerItem] = useState<
    ServerListItem | undefined | null
  >();
  const setStatus = (status: boolean) => {
    if (!serverItem) return;

    const nextServerItem = {
      ...serverItem,
      status: status ? 'online' : 'offline',
    } as ServerListItem;

    setServerItem(nextServerItem);
  };

  const serverItemQuery = useQuery({
    queryKey: ['serverList'],
    queryFn: fetchServerList,
    onSuccess: ({ servers }) => {
      const found = servers.filter((s) => s.name === '/' + serverName).at(0);
      setServerItem(found || null);
    },
  });

  if (serverItem === undefined) {
    return <div>loading...</div>;
  }

  if (serverItem === null) {
    return <div>not found</div>;
  }

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between my-3">
        <div className="flex items-center gap-x-2">
          <div className="prose dark:prose-invert prose-sm md:prose-base">
            <h1 className="">{'/' + serverName}</h1>
          </div>
          <ServerStatus
            name={serverItem.name}
            status={serverItem.status === 'online' ? true : false}
            setStatus={setStatus}
          />
        </div>

        <div className="flex my-2 md:my-0">
          <ServerActions
            isOnline={serverItem.status === 'online' ? true : false}
            id={serverItem!.id}
          />
        </div>
      </div>

      <Tabs defaultValue="console" className="overflow-auto">
        <TabsList className="grid grid-rows-2 h-[80px] md:h-[40px] md:grid-rows-1 grid-cols-5 max-w-md">
          <TabsTrigger
            value="console"
            className="col-span-3 md:col-span-1 md:col-start-1"
          >
            Console
          </TabsTrigger>
          <TabsTrigger
            value="files"
            className="col-start-4 col-span-2 md:col-span-1 md:col-start-2 md:row-start-1"
          >
            Files
          </TabsTrigger>
          <TabsTrigger
            value="whitelist"
            className=" row-start-2 col-span-2 md:col-span-1 md:row-start-1 md:col-start-3"
          >
            Whitelist
          </TabsTrigger>
          <TabsTrigger
            value="worlds"
            className="row-start-2 col-start-3 col-span-2 md:col-start-4 md:row-start-1 md:col-span-1"
          >
            Worlds
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="row-start-2 col-start-5 md:row-start-1"
          >
            <SettingsIcon size={20} />
          </TabsTrigger>
        </TabsList>
        <TabsContent value="console">
          <Console serverItem={serverItem} />
        </TabsContent>
        <TabsContent value="files">
          <FileExplorer id={serverItem.id} game={'minecraft'} />
        </TabsContent>
        <TabsContent value="whitelist">
          <Whitelist serverId={serverItem.id} />
        </TabsContent>
        <TabsContent value="worlds">
          <Worlds id={serverItem.id} />
        </TabsContent>
        <TabsContent value="settings">
          <Settings
            serverId={serverItem.id}
            onUpdateSuccess={() => {
              setServerItem(undefined);
              serverItemQuery.refetch();
            }}
          />
        </TabsContent>
      </Tabs>
    </>
  );
}
