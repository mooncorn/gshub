import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';

import { ActionProvider } from './_components/action-provider';

export default async function MinecraftControlPage() {
  const session = await getServerSession();

  if (!session) redirect('/');

  return (
    <main>
      <ActionProvider />
    </main>
  );
}
