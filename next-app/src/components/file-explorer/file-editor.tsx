'use client';

import { GetFileContentData } from '@/api/file-explorer/file';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Textarea } from '../ui/textarea';
import { toPath } from './file-exporer';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';

interface FileEditorProps extends React.HTMLAttributes<HTMLDivElement> {
  pathItems: string[];
  fetchFileContent: ({
    game,
    path,
  }: {
    path: string;
    game: string;
  }) => Promise<GetFileContentData>;
  updateFileContent: ({
    path,
    content,
    game,
  }: {
    path: string;
    content: string;
    game: string;
  }) => Promise<any>;
  onClose: () => void;
  game: string;
}

export function FileEditor({
  pathItems,
  fetchFileContent,
  updateFileContent,
  onClose,
  className,
  game,
  ...props
}: FileEditorProps) {
  const [fileContent, setFileContent] = useState('');
  const [modifiedFileContent, setModifiedFileContent] = useState('');
  const { toast } = useToast();

  const fileContentQuery = useQuery({
    queryKey: ['file', toPath(pathItems)],
    queryFn: ({ queryKey }) => fetchFileContent({ path: queryKey[1]!, game }),
    onSuccess: (data) => {
      setFileContent(data.content);
      setModifiedFileContent(data.content);
    },
    retry: false,
  });

  const updateFileContentMutation = useMutation({
    mutationFn: ({ path, content }: { path: string; content: string }) =>
      updateFileContent({ path, content, game }),
    onSuccess: () => {
      toast({ title: 'File saved successfully' });
      fileContentQuery.refetch();
    },
    onError: (err) =>
      err instanceof Error &&
      toast({
        title: 'Failed to save file',
        content: err.message,
        variant: 'destructive',
      }),
  });

  return (
    <div {...props} className={cn('flex flex-col gap-2', className)}>
      <Textarea
        className="h-[300px]"
        value={modifiedFileContent}
        onChange={(e) => setModifiedFileContent(e.currentTarget.value)}
      />
      <div className="flex gap-2">
        <Button
          style={{ backgroundColor: 'green' }}
          onClick={() =>
            updateFileContentMutation.mutate({
              content: modifiedFileContent,
              path: toPath(pathItems),
            })
          }
          disabled={
            updateFileContentMutation.isLoading ||
            modifiedFileContent === fileContent
          }
        >
          Save
        </Button>
        <Button
          style={{ backgroundColor: 'orange' }}
          onClick={() => setModifiedFileContent(fileContent)}
          disabled={modifiedFileContent === fileContent}
        >
          Undo
        </Button>
        <Button style={{ backgroundColor: 'red' }} onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
