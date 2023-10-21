'use client';

import Link from 'next/link';

import { cn } from '@/lib/utils';
import { Session } from 'next-auth';

interface MainNavProps extends React.HTMLAttributes<HTMLElement> {
  session: Session | null;
}

export function MainNav({ session, className, ...props }: MainNavProps) {
  return (
    <nav
      className={cn('flex items-center space-x-4 lg:space-x-6', className)}
      {...props}
    >
      <Link
        href={'/'}
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        GSH 2.0
      </Link>

      {session?.user && (
        <div className="flex gap-x-3">
          {/* <Link
            href="/minecraft"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Minecraft
          </Link>
          <Link
            href="/valheim"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Valheim
          </Link> */}
        </div>
      )}
    </nav>
  );
}
