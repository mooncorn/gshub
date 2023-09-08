'use client';

import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

interface FileExplorerPathProps extends React.HTMLAttributes<HTMLDivElement> {
  items: string[];
  onClickedItem(index: number): void;
}

export function FileExplorerPath({
  items,
  onClickedItem,
  className,
  ...props
}: FileExplorerPathProps) {
  const renderPathItems = () =>
    items.map((pathItem, index) => (
      <>
        <Button className="px-0" variant="link" disabled key={'/' + pathItem}>
          /
        </Button>
        <Button
          key={pathItem}
          className="px-0"
          variant="link"
          onClick={() => onClickedItem(index)}
        >
          {pathItem}
        </Button>
      </>
    ));

  return (
    <div
      {...props}
      className={cn('flex flex-row gap-2 font-medium', className)}
    >
      <Button className="px-0" variant="link" onClick={() => onClickedItem(-1)}>
        root
      </Button>
      {renderPathItems()}
    </div>
  );
}
