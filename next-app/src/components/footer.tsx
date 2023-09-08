import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Github } from 'lucide-react';

export function Footer({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn('flex items-center h-14 border-t shadow', className)}>
      <div className="container py-2 h-fit flex items-center">
        <a
          href="https://github.com/mooncorn/gameserverhub"
          target="_blank"
          className="text-sm font-medium transition-colors hover:text-primary flex gap-2 items-center"
        >
          <Github />
          Github
        </a>
        {/* <Link
          href={'#'}
          className="text-sm font-medium transition-colors hover:text-primary"
        >
          Github
        </Link> */}
      </div>
    </footer>
  );
}
