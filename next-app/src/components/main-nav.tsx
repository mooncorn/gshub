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
        href={session?.user ? '/home' : '/'}
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        GameServerHub
      </Link>

      {/* {session?.user && (
        <Link
          href="#"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Servers
        </Link>
      )} */}
    </nav>
  );
}
