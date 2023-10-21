'use client';

export default function Content({ loggedIn }: { loggedIn: boolean }) {
  if (!loggedIn)
    return (
      <main>
        <div className="prose max-w-md mx-auto my-3 dark:prose-invert">
          <h1>Server Management Hub</h1>
          <p>
            Efficiently manage game servers, including controlling their
            startup, shutdown, executing console commands remotely, and
            navigating and editing server files using a built-in file explorer.
          </p>
        </div>
      </main>
    );

  // Don't show anything by default because the client is redirected to the first game automatically.
}
