import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';

export default async function LandingPage() {
  const session = await getServerSession();

  if (session) redirect('/home');

  return (
    <main>
      <div className="prose max-w-md mx-auto my-3 dark:prose-invert">
        <h1>Server Management Hub</h1>
        <p>
          Efficiently manage game servers, including controlling their startup,
          shutdown, executing console commands remotely, and navigating and
          editing server files using a built-in file explorer.
        </p>
      </div>
    </main>
  );
}
