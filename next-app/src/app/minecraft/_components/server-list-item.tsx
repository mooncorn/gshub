'use client';

import { Power, Trash2 } from 'lucide-react';
import { ServerStatus } from '../../../components/server-status';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import Link from 'next/link';
import { ServerListItem, deleteServer, start, stop } from '@/api/minecraft';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { AxiosError } from 'axios';

interface ServerListItemProps {
  serverItem: ServerListItem;
  serverList: ServerListItem[];
  setStatus: (status: boolean) => void;
  refetchServerList: () => void;
}

export function MinecraftServerListItem({
  serverItem,
  serverList,
  setStatus,
  refetchServerList,
}: ServerListItemProps) {
  const { toast } = useToast();

  const startMutation = useMutation({
    mutationFn: start,
    onSuccess: () => setStatus(true),
    onError: (err) => {
      if (err instanceof AxiosError)
        toast({
          title: 'Error',
          description: err.message,
          variant: 'destructive',
        });
    },
  });

  const stopMutation = useMutation({
    mutationFn: stop,
    onSuccess: () => setStatus(false),
    onError: (err) => {
      if (err instanceof AxiosError)
        toast({
          title: 'Error',
          description: err.message,
          variant: 'destructive',
        });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteServer,
    onSuccess: () => refetchServerList(),
    onError: (err) => {
      if (err instanceof AxiosError)
        toast({
          title: 'Error',
          description: err.message,
          variant: 'destructive',
        });
    },
  });

  return (
    <Card className="flex justify-between shadow">
      <CardHeader className="py-2 px-2 md:px-6">
        <CardTitle>
          <Link href={'/minecraft/' + serverItem.name}>
            <Button variant="link" className="md:text-2xl p-0 m-0">
              {serverItem.name}
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex md:gap-x-2 py-2 px-1 md:px-6">
        <ServerStatus
          name={serverItem.name}
          status={serverItem.status === 'online' ? true : false}
          setStatus={setStatus}
        />

        <Button
          variant={'ghost'}
          className="p-3 m-0"
          disabled={
            stopMutation.isLoading ||
            startMutation.isLoading ||
            serverList.filter(
              (s) => s.id !== serverItem.id && s.status === 'online'
            ).length >= 1
          }
          onClick={() => {
            serverItem.status === 'offline'
              ? startMutation.mutate({ id: serverItem.id })
              : stopMutation.mutate({ id: serverItem.id });
          }}
        >
          <Power
            className="m-auto"
            color={serverItem.status === 'offline' ? 'green' : 'red'}
            size={18}
            strokeWidth={3}
          />
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant={'ghost'}
              className="px-3 m-0"
              disabled={serverItem.status === 'offline' ? false : true}
            >
              <Trash2
                className="m-auto"
                color="red"
                size={18}
                strokeWidth={2}
              />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                server and its data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteMutation.mutate({ id: serverItem.id })}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
