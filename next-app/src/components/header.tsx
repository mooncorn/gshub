import { MainNav } from './main-nav';
import { ThemeToggle } from './theme-toggle';
import { UserNav } from './user-nav';
import { getServerSession } from 'next-auth';

export async function Header() {
  const session = await getServerSession();

  return (
    <header className="border-b shadow">
      <div className="container py-2 h-fit flex items-center">
        <MainNav session={session} />

        <div className="ml-auto flex items-center space-x-4">
          <ThemeToggle />
          <UserNav session={session} />
        </div>
      </div>
    </header>
  );
}
