import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { Dashboard } from './_components/dashboard';

export default async function MinecraftControlPage() {
  const session = await getServerSession();

  if (!session) redirect('/');

  return (
    <main>
      <Dashboard />
    </main>
  );
}
