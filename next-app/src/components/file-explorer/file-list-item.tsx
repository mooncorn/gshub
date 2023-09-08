'use client';

import { FileData } from '@/api/file-explorer/files';
import { cn } from '@/lib/utils';
import { FolderClosed } from 'lucide-react';
import { TableCell, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { canOpenFileOrDirectory } from './file-exporer';

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = [
    'Bytes',
    'KiB',
    'MiB',
    'GiB',
    'TiB',
    'PiB',
    'EiB',
    'ZiB',
    'YiB',
  ];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

interface FileListItemProps extends React.HTMLAttributes<HTMLElement> {
  file: FileData;
  onNameClick: () => void;
}

export function FileListItem({
  file,
  onNameClick,
  className,
  ...props
}: FileListItemProps) {
  return (
    <TableRow {...props} className={cn(className)}>
      <TableCell>{file.isDirectory && <FolderClosed />}</TableCell>
      <TableCell>
        <Button
          variant={'link'}
          className="p-0"
          disabled={!canOpenFileOrDirectory(file)}
          onClick={() => onNameClick()}
        >
          {file.name}
        </Button>
      </TableCell>
      <TableCell className="text-right">
        {file.isFile && formatBytes(file.size)}
      </TableCell>
      <TableCell className="text-right ">
        <div>{new Date(file.lastModified).toLocaleTimeString()}</div>
        <div>{new Date(file.lastModified).toDateString()}</div>
      </TableCell>
    </TableRow>
  );
}
