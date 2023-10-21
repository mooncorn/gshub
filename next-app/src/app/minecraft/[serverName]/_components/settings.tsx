import { useMutation } from '@tanstack/react-query';
import { cmd as executeCommand } from '@/api/minecraft';
import { toast } from '@/components/ui/use-toast';
import { AxiosError } from 'axios';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { update } from '@/api/minecraft/update';
import { useState } from 'react';

export default function Settings({
  serverId,
  onUpdateSuccess,
}: {
  serverId: string;
  onUpdateSuccess: () => void;
}) {
  const [version, setVersion] = useState('');

  const enableWhitelist = useMutation({
    mutationKey: ['enableWhitelist'],
    mutationFn: ({ cmd }: { cmd: string }) =>
      executeCommand({ id: serverId, cmd }),
    onSuccess: (data) => {
      toast({
        description: data.message,
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

  const updateMutation = useMutation({
    mutationFn: update,
    onSuccess: () => {
      onUpdateSuccess();
      toast({
        description: 'Server updated successfully.',
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

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center space-x-2 p-2">
        <Label>Whitelist:</Label>
        <Button
          variant={'outline'}
          onClick={() => enableWhitelist.mutate({ cmd: 'whitelist on' })}
          disabled={enableWhitelist.isLoading}
        >
          Enable
        </Button>
        <Button
          variant={'outline'}
          onClick={() => enableWhitelist.mutate({ cmd: 'whitelist off' })}
          disabled={enableWhitelist.isLoading}
        >
          Disable
        </Button>
      </div>
      <Separator />
      <div className="flex items-center space-x-2 p-2">
        <Label>Version:</Label>
        <Input
          type="text"
          placeholder="Change minecraft version"
          value={version}
          onChange={(e) => setVersion(e.target.value)}
        />
        <Button
          variant={'outline'}
          onClick={() => updateMutation.mutate({ id: serverId, version })}
        >
          Change
        </Button>
      </div>
      <Separator />
      <div className="flex items-center space-x-2 p-2">
        <Label>Plugins:</Label>
        <Button
          variant={'outline'}
          onClick={() =>
            updateMutation.mutate({ id: serverId, type: 'SPIGOT' })
          }
        >
          Enable
        </Button>
        <Button
          variant={'outline'}
          onClick={() =>
            updateMutation.mutate({ id: serverId, type: 'VANILLA' })
          }
        >
          Disable
        </Button>
      </div>
    </div>
  );
}
