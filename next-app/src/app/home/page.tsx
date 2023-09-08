import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { ServerList } from './_components/server-list';

export default async function HomePage() {
  const session = await getServerSession();

  if (!session) redirect('/');

  return (
    <main>
      <ServerList />
    </main>
  );
}
