import './globals.css';
import { Header } from '@/components/header';
import Menu from './_components/menu';
import { ContextProvider } from '@/components/context-provider';
import { Footer } from '@/components/footer';
import { Toaster } from '@/components/ui/toaster';
import { getServerSession } from 'next-auth';

export default async function RootLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  return (
    <html>
      <head></head>
      <body>
        <ContextProvider>
          <div className="flex flex-col justify-between min-h-screen">
            <Header />

            <div className="py-2 md:py-18 flex-grow px-2 md:container">
              <Menu loggedIn={session !== null} />

              {children}
            </div>
            <Footer />
            <Toaster />
          </div>
        </ContextProvider>
      </body>
    </html>
  );
}
