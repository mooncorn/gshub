'use client';

import { User } from 'next-auth';
import { signIn, signOut } from 'next-auth/react';

interface UserDropdownProps {
  user?: User;
}

export function UserDropdown({ user }: UserDropdownProps) {
  return (
    <div className="flex">
      <div className="pr-2">{user?.email}</div>
      {user ? (
        <button onClick={() => signOut()}>Sign Out</button>
      ) : (
        <button onClick={() => signIn()}>Log In</button>
      )}
    </div>
  );
}
