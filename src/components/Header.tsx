'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, Moon, Sun, LayoutDashboard, ListChecks } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <nav className="container mx-auto flex items-center justify-between p-4">
        <Link href="/" className="text-2xl font-bold hover:opacity-80 transition-opacity">
          QuickPoll
        </Link>
        <div className="space-x-1 sm:space-x-2 flex items-center">
          <Button variant="ghost" asChild className="hover:bg-primary-foreground/10 hover:text-primary-foreground text-xs sm:text-sm px-2 sm:px-3">
            <Link href="/polls">
              <ListChecks className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Active Polls
            </Link>
          </Button>
           <Button variant="ghost" asChild className="hover:bg-primary-foreground/10 hover:text-primary-foreground text-xs sm:text-sm px-2 sm:px-3">
            <Link href="/dashboard">
              <LayoutDashboard className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Dashboard
            </Link>
          </Button>
          <Button variant="ghost" asChild className="hover:bg-primary-foreground/10 hover:text-primary-foreground text-xs sm:text-sm px-2 sm:px-3">
            <Link href="/create">
              <PlusCircle className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Create Poll
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
            className="hover:bg-primary-foreground/10 hover:text-primary-foreground h-8 w-8 sm:h-10 sm:w-10"
          >
            <Sun className="h-4 w-4 sm:h-5 sm:w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 sm:h-5 sm:w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </nav>
    </header>
  );
}
