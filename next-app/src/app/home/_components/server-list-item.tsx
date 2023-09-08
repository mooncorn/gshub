'use client';

import { ServerStatus } from '../../../components/server-status';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';

interface ServerListItemProps {
  name: string;
  status: boolean;
  setStatus: (status: boolean) => void;
}

export function ServerListItem({
  name,
  status,
  setStatus,
}: ServerListItemProps) {
  return (
    <Card className="flex items-center justify-between shadow">
      <CardHeader>
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-baseline h-[1rem]">
        <ServerStatus name={name} status={status} setStatus={setStatus} />
      </CardContent>
    </Card>
  );
}
