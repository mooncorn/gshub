'use client';

import { ServerActions } from '@/components/server-actions';
import { ServerStatus } from '@/components/server-status';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Spinner } from '@/components/spinner';
import { FileExplorer } from '@/components/file-explorer/file-exporer';
import { getFiles } from '@/api/files/files';
import { getFileContent } from '@/api/files/file';
import { GetStatusData } from '@/api';
import { Console } from '@/components/console';
import { AxiosResponse } from 'axios';

interface DashboardProps {
  game: string;
  fetchStatus: () => Promise<GetStatusData>;
  fetchConsole: () => Promise<{ console: string }>;
  executeCommand?: (cmd: string) => Promise<AxiosResponse<any, any>>;
  start: () => Promise<AxiosResponse<any, any>>;
  stop: () => Promise<AxiosResponse<any, any>>;
  restart: () => Promise<AxiosResponse<any, any>>;
}

export function Dashboard({
  game,
  fetchConsole,
  fetchStatus,
  executeCommand,
  start,
  stop,
  restart,
}: DashboardProps) {
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
            <h1 className="">{game}</h1>
          </div>

          {statusQuery.isLoading ? (
            <Spinner />
          ) : (
            <ServerStatus name={game} status={status} setStatus={setStatus} />
          )}
        </div>

        <div className="flex my-2 md:my-0">
          {statusQuery.isLoading ? (
            <Spinner />
          ) : (
            <ServerActions
              isOnline={status}
              start={start}
              stop={stop}
              restart={restart}
            />
          )}
        </div>
      </div>

      <Tabs defaultValue="console">
        <TabsList className="grid grid-cols-2 max-w-md">
          <TabsTrigger value="console">Console</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
        </TabsList>
        <TabsContent value="console">
          <Console
            game={game}
            isOnline={status}
            fetchConsole={fetchConsole}
            executeCommand={executeCommand}
          />
        </TabsContent>
        <TabsContent value="files">
          <FileExplorer game={'valheim'} id="valheim" />
        </TabsContent>
      </Tabs>
    </>
  );
}
