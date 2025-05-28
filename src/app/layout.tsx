import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import Header from '@/components/Header';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'QuickPoll - Instant Polls',
  description: 'Create and share polls instantly with QuickPoll.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans antialiased flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
        <Toaster />
        <footer className="bg-muted text-muted-foreground text-center p-4 text-sm">
          © {new Date().getFullYear()} QuickPoll. Create polls quickly and easily.
        </footer>
      </body>
    </html>
  );
}
