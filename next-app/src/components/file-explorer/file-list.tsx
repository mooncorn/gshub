'use client';

import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

export function FileList({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <Table {...props} className={cn(className)}>
      <TableCaption>Minecraft server files.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]"></TableHead>
          <TableHead>Name</TableHead>
          <TableHead className="text-right">Size</TableHead>
          <TableHead className="text-right">Last Modified</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>{props.children}</TableBody>
    </Table>
  );
}
