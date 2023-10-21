'use client';

import { GetFileContentData } from '@/api/files/file';
import { FileData, GetFilesData } from '@/api/files/files';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { FileListItem } from './file-list-item';
import { FileList } from './file-list';
import { FileExplorerPath } from './file-explorer-path';
import { FileEditor } from './file-editor';
import { getFiles } from '@/api/files/files';

function sortFilesAndDirectories(files: FileData[]) {
  return files.sort((a, b) => {
    // Compare directories before files and then alphabetically
    if (a.isDirectory && !b.isDirectory) {
      return -1; // a comes before b
    } else if (!a.isDirectory && b.isDirectory) {
      return 1; // b comes before a
    } else {
      // Both are directories or both are files, sort them alphabetically
      return a.name.localeCompare(b.name);
    }
  });
}

const READABLE_FILES_REGEX = new RegExp('.+\\.(json|txt|properties|yml)');

export function toPath(pathItems: string[]): string {
  return '/' + pathItems.join('/');
}

export const canReadFile = (path: string): boolean =>
  READABLE_FILES_REGEX.test(path);

export const canOpenFileOrDirectory = (file: FileData): boolean =>
  file.isDirectory || canReadFile(file.name);

interface FileExplorerProps {
  id: string;
  game: string;
}

export function FileExplorer({ id, game }: FileExplorerProps) {
  const [files, setFiles] = useState<FileData[]>([]);
  const [pathItems, setPathItems] = useState<string[]>([]);
  const [showFileEditor, setShowFileEditor] = useState(false);

  const filesQuery = useQuery({
    queryKey: ['files', toPath(pathItems)],
    queryFn: (data) => getFiles({ path: data.queryKey[1]!, game, id }),
    onSuccess: (data) => setFiles(sortFilesAndDirectories(data.files)),
    enabled: !showFileEditor,
  });

  const onFileListItemClick = (file: FileData): void => {
    if (canOpenFileOrDirectory(file)) {
      setPathItems((prev) => [...prev, file.name]);
      canReadFile(file.name) && setShowFileEditor(true);
    }
  };

  const onFileEditorClose = () => {
    setShowFileEditor(false);
    setPathItems(pathItems.slice(0, -1));
  };

  const renderFiles = () =>
    files.map((file) => (
      <FileListItem
        key={file.name}
        onNameClick={() => onFileListItemClick(file)}
        file={file}
        className={canOpenFileOrDirectory(file) ? 'cursor-pointer' : ''}
      />
    ));

  const onPathItemClick = (index: number) => {
    if (index === -1) setPathItems([]);
    else setPathItems(pathItems.slice(0, index + 1));

    setShowFileEditor(false);
  };

  return (
    <div>
      <FileExplorerPath items={pathItems} onClickedItem={onPathItemClick} />
      {showFileEditor ? (
        <FileEditor
          id={id}
          game={game}
          pathItems={pathItems}
          onClose={onFileEditorClose}
        />
      ) : (
        <FileList>{renderFiles()}</FileList>
      )}
    </div>
  );
}
