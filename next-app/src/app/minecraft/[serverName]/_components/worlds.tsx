'use client';

import getWorlds, { World } from '@/api/minecraft/words/list';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import uploadWorld from '@/api/minecraft/words/upload';
import activateWorld from '@/api/minecraft/words/set-active';

export default function Worlds({ id }: { id: string }) {
  const [world, setWorld] = useState<File | null>(null);
  const [worlds, setWorlds] = useState<World[]>([]);

  const worldsQuery = useQuery({
    queryFn: () => getWorlds({ id }),
    queryKey: ['getWorlds'],
    onSuccess: (data) => setWorlds(data.worlds),
    onError: (err) => {
      if (err instanceof AxiosError)
        toast({
          title: 'Error',
          description: err.response?.data.errors[0].message,
          variant: 'destructive',
        });
    },
  });

  const uploadWorldMutation = useMutation({
    mutationKey: ['uploadWorld'],
    mutationFn: uploadWorld,
    onSuccess: () => {
      worldsQuery.refetch();
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

  const activateWorldMutation = useMutation({
    mutationKey: ['activateWorld'],
    mutationFn: activateWorld,
    onSuccess: () => worldsQuery.refetch(),
    onError: (err) => {
      if (err instanceof AxiosError)
        toast({
          title: 'Error',
          description: err.response?.data.errors[0].message,
          variant: 'destructive',
        });
    },
  });

  const renderWorlds = () =>
    worlds.map((world) => (
      <Card key={world.name} className="flex justify-between shadow">
        <CardHeader className="py-2 px-2 md:px-6">
          <CardTitle className="py-2">{world.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex md:gap-x-2 py-2 px-1 md:px-6">
          <Button
            variant={'link'}
            className="px-3 m-0"
            disabled={world.active}
            onClick={() =>
              activateWorldMutation.mutate({ id, name: world.name })
            }
          >
            {world.active ? 'Active' : 'Activate'}
          </Button>
        </CardContent>
      </Card>
    ));

  return (
    <div className="flex flex-col gap-2">
      <div className="border px-5 py-3 rounded-lg">
        <h1 className="text-2xl font-semibold leading-none tracking-tight mb-2">
          Upload New World
        </h1>
        <div className="flex items-center gap-x-2">
          <Input
            type="file"
            onChange={(e) => {
              setWorld(e.target.files ? e.target.files.item(0) : null);
            }}
            placeholder="Enter world name"
            accept=".zip,.rar,.7zip"
          />
          <Button
            style={{ backgroundColor: 'green' }}
            disabled={world === null || uploadWorldMutation.isLoading}
            onClick={() => uploadWorldMutation.mutate({ id, world: world! })}
          >
            Upload
          </Button>
        </div>
      </div>
      <div className="  text-gray-500 flex justify-between align-bottom">
        <div>Worlds: {worlds.length}</div>
        <Button
          variant={'ghost'}
          className="p-1 h-[20px]"
          disabled={worldsQuery.isLoading}
          onClick={() => worldsQuery.refetch()}
        >
          <RotateCcw size={18} />
        </Button>
      </div>
      {renderWorlds()}
    </div>
  );
}
