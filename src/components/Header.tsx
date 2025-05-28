import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, PlusCircle } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <nav className="container mx-auto flex items-center justify-between p-4">
        <Link href="/" className="text-2xl font-bold hover:opacity-80 transition-opacity">
          QuickPoll
        </Link>
        <div className="space-x-2">
          <Button variant="ghost" asChild>
            <Link href="/create">
              <PlusCircle className="mr-2 h-5 w-5" /> Create Poll
            </Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
