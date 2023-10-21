import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { MinecraftServerList } from './_components/minecraft-server-list';

export default async function MinecraftPage() {
  const session = await getServerSession();

  if (!session) redirect('/');

  return (
    <main>
      <MinecraftServerList />
    </main>
  );
}
