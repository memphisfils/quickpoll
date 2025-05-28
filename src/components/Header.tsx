'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <nav className="container mx-auto flex items-center justify-between p-4">
        <Link href="/" className="text-2xl font-bold hover:opacity-80 transition-opacity">
          QuickPoll
        </Link>
        <div className="space-x-2 flex items-center">
          <Button variant="ghost" asChild className="hover:bg-primary-foreground/10 hover:text-primary-foreground">
            <Link href="/create">
              <PlusCircle className="mr-2 h-5 w-5" /> Create Poll
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
            className="hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </nav>
    </header>
  );
}
