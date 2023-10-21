import { getServerSession } from 'next-auth/next';
import Content from './_components/content';
import { redirect } from 'next/navigation';

export default async function LandingPage() {
  const session = await getServerSession();

  if (session) {
    redirect('/minecraft');
  }

  return <Content loggedIn={session !== null} />;
}
