import './globals.css';
import { Header } from '@/components/header';
import type { Metadata } from 'next';
import { ContextProvider } from '@/components/context-provider';
import { Footer } from '@/components/footer';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'GameServerHub',
  description: 'Hub for game servers',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ContextProvider>
          <div className="flex flex-col justify-between min-h-screen">
            <Header />
            <div className="container py-2 md:py-18 flex-grow">{children}</div>
            <Footer />
            <Toaster />
          </div>
        </ContextProvider>
      </body>
    </html>
  );
}
