'use client';

import { ServerActions } from '@/app/minecraft/_components/server-actions';
import { ServerStatus } from '@/components/server-status';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { status as fetchStatus } from '@/api/minecraft';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Console } from './console';
import { Spinner } from '@/components/spinner';
import { FileExplorer } from '@/components/file-explorer/file-exporer';
import { getFiles } from '@/api/file-explorer/files';
import { getFileContent } from '@/api/file-explorer/file';

export function Dashboard() {
  const [status, setStatus] = useState(false);

  const statusQuery = useQuery({
    queryKey: ['status'],
    queryFn: fetchStatus,
    onSuccess: ({ status }) => setStatus(status === 'online'),
  });

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between my-3">
        <div className="flex items-center gap-x-2">
          <div className="prose dark:prose-invert prose-sm md:prose-base">
            <h1 className="">Minecraft</h1>
          </div>

          {statusQuery.isLoading ? (
            <Spinner />
          ) : (
            <ServerStatus
              name="minecraft"
              status={status}
              setStatus={setStatus}
            />
          )}
        </div>

        <div className="flex my-2 md:my-0">
          {statusQuery.isLoading ? (
            <Spinner />
          ) : (
            <ServerActions isOnline={status} />
          )}
        </div>
      </div>

      <Tabs defaultValue="console">
        <TabsList className="grid grid-cols-2 max-w-md">
          <TabsTrigger value="console">Console</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
        </TabsList>
        <TabsContent value="console">
          <Console isOnline={status} />
        </TabsContent>
        <TabsContent value="files">
          <FileExplorer
            fetchFiles={getFiles}
            fetchFileContent={getFileContent}
          />
        </TabsContent>
      </Tabs>
    </>
  );
}
