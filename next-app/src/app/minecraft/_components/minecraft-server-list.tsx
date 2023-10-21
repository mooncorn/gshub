'use client';

import { MinecraftServerListItem } from '@/app/minecraft/_components/server-list-item';
import { useState } from 'react';
import {
  ServerListItem as ServerListItemData,
  create,
  fetchServerList,
} from '@/api/minecraft';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { AxiosError } from 'axios';
import { RotateCcw } from 'lucide-react';
import { Label } from '@/components/ui/label';

export function MinecraftServerList() {
  const [pluginsChecked, setPluginsChecked] = useState(false);
  const [version, setVersion] = useState('LATEST');
  const [serverList, setServerList] = useState<ServerListItemData[]>([]);
  const setStatus = (id: string, status: 'offline' | 'online') => {
    const nextServerList = serverList.map((s) => {
      if (s.id === id) {
        s.status = status;
      }

      return s;
    });

    setServerList(nextServerList);
  };
  const [serverNameInput, setServerNameInput] = useState('');
  const { toast } = useToast();

  const serverListQuery = useQuery({
    queryKey: ['serverList'],
    queryFn: fetchServerList,
    onSuccess: ({ servers }) => setServerList(servers),
    cacheTime: 0,
  });

  const refetchServerList = () => serverListQuery.refetch();

  const createMutation = useMutation({
    mutationFn: create,
    onSuccess: () => {
      setServerNameInput('');
      setPluginsChecked(false);
      setVersion('LATEST');
      refetchServerList();
      toast({
        description: 'Server created',
        variant: 'default',
      });
    },
    onError: (err) => {
      if (err instanceof AxiosError)
        toast({
          title: 'Error',
          description: err.response?.data.errors[0].message,
          variant: 'destructive',
        });
    },
  });

  const renderServerList = () =>
    serverList.map((s) => (
      <MinecraftServerListItem
        key={s.id}
        serverItem={s}
        serverList={serverList}
        refetchServerList={refetchServerList}
        setStatus={(status) => setStatus(s.id, status ? 'online' : 'offline')}
      />
    ));

  return (
    <div className="flex flex-col gap-2">
      <div className="border px-5 py-3 rounded-lg">
        <h1 className="text-2xl font-semibold leading-none tracking-tight mb-2">
          Create New
        </h1>
        <div className="flex flex-col gap-y-4">
          <div>
            <Label>Name</Label>
            <Input
              value={serverNameInput}
              onChange={(e) => setServerNameInput(e.target.value)}
              type="text"
              placeholder="Enter server name"
            />
          </div>
          <div>
            <Label>Version (example: 1.19.1)</Label>
            <Input
              type="text"
              placeholder="Enter minecraft version"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
            />
          </div>
          <div className="flex flex-row items-center space-x-2">
            <Label className="align-bottom">Plugins</Label>
            <Input
              type="checkbox"
              className="block w-[20px]"
              checked={pluginsChecked}
              onChange={(e) => setPluginsChecked(e.target.checked)}
            />
          </div>

          <Button
            style={{ backgroundColor: 'green' }}
            className="w-[75px] ms-auto"
            disabled={serverNameInput.length === 0}
            onClick={() =>
              createMutation.mutate({
                name: serverNameInput,
                version,
                type: pluginsChecked ? 'SPIGOT' : 'VANILLA',
              })
            }
          >
            Create
          </Button>
        </div>
      </div>
      <div className="  text-gray-500 flex justify-between align-bottom">
        <div>Servers: {serverList.length}</div>
        <Button
          variant={'ghost'}
          className="p-1 h-[20px]"
          disabled={serverListQuery.isLoading}
          onClick={() => refetchServerList()}
        >
          <RotateCcw size={18} />
        </Button>
      </div>
      {renderServerList()}
    </div>
  );
}
