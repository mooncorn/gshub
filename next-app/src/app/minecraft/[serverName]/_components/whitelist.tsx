'use client';

import whitelistGet, { WhitelistUser } from '@/api/minecraft/whitelist/list';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMutation, useQuery } from '@tanstack/react-query';
import { RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { AxiosError } from 'axios';
import whitelistAdd from '@/api/minecraft/whitelist/add';
import whitelistRemove from '@/api/minecraft/whitelist/remove';

export default function Whitelist({ serverId }: { serverId: string }) {
  const [username, setUsername] = useState('');
  const [whitelist, setWhitelist] = useState<WhitelistUser[]>([]);

  const whitelistQuery = useQuery({
    queryFn: () => whitelistGet({ id: serverId }),
    queryKey: ['whitelist'],
    onSuccess: (data) => setWhitelist(data.whitelist),
    onError: (err) => {
      if (err instanceof AxiosError)
        toast({
          title: 'Error',
          description: err.response?.data.errors[0].message,
          variant: 'destructive',
        });
    },
    cacheTime: 0,
  });

  const addMutation = useMutation({
    mutationKey: ['addToWhitelist'],
    mutationFn: whitelistAdd,
    onSuccess: (data) => {
      toast({
        description: data.message,
        variant: 'default',
      });
      setUsername('');

      whitelistQuery.refetch();
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

  const removeMutation = useMutation({
    mutationKey: ['removeFromWhitelist'],
    mutationFn: whitelistRemove,
    onSuccess: () => whitelistQuery.refetch(),
    onError: (err) => {
      if (err instanceof AxiosError)
        toast({
          title: 'Error',
          description: err.response?.data.errors[0].message,
          variant: 'destructive',
        });
    },
  });

  const renderWhitelist = () =>
    whitelist.map((item) => (
      <Card key={item.uuid} className="flex justify-between shadow">
        <CardHeader className="py-2 px-2 md:px-6">
          <CardTitle className="py-2">{item.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex md:gap-x-2 py-2 px-1 md:px-6">
          <Button
            variant={'ghost'}
            className="px-3 m-0"
            disabled={addMutation.isLoading || removeMutation.isLoading}
            onClick={() =>
              removeMutation.mutate({ id: serverId, username: item.name })
            }
          >
            <Trash2 className="m-auto" color="red" size={18} strokeWidth={2} />
          </Button>
        </CardContent>
      </Card>
    ));

  return (
    <div className="flex flex-col gap-2">
      <div className="border px-5 py-3 rounded-lg">
        <h1 className="text-2xl font-semibold leading-none tracking-tight mb-2">
          Add User
        </h1>
        <div className="flex items-center gap-x-2">
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            type="text"
            placeholder="Enter username"
          />
          <Button
            style={{ backgroundColor: 'green' }}
            disabled={addMutation.isLoading || username.length === 0}
            onClick={() => addMutation.mutate({ id: serverId, username })}
          >
            Add
          </Button>
        </div>
      </div>
      <div className="  text-gray-500 flex justify-between align-bottom">
        <div>Whitelisted Users: {whitelist.length}</div>
        <Button
          variant={'ghost'}
          className="p-1 h-[20px]"
          disabled={whitelistQuery.isLoading}
          onClick={() => whitelistQuery.refetch()}
        >
          <RotateCcw size={18} />
        </Button>
      </div>
      {renderWhitelist()}
    </div>
  );
}
