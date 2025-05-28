import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { ArrowRight, BarChartBig } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Card className="w-full max-w-2xl text-center shadow-xl overflow-hidden border-border">
        <CardHeader className="bg-card p-8">
          <div className="mx-auto bg-primary text-primary-foreground p-4 rounded-full w-fit mb-6 shadow-md">
            <BarChartBig size={48} />
          </div>
          <CardTitle className="text-4xl font-bold text-primary">Welcome to QuickPoll!</CardTitle>
          <CardDescription className="text-xl text-muted-foreground mt-2 max-w-md mx-auto">
            Create, share, and analyze polls in an instant. Get feedback quickly and easily.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8 bg-background">
          <p className="text-lg text-foreground/90">
            Whether it&apos;s for a quick team decision, gathering opinions, or collecting project feedback, QuickPoll simplifies the process.
          </p>
          <div className="rounded-lg overflow-hidden shadow-lg border border-border aspect-[2/1] relative">
            <Image
              src="https://placehold.co/600x300.png"
              alt="Abstract representation of data and polls"
              fill
              style={{objectFit: "cover"}}
              className="w-full h-auto"
              data-ai-hint="poll analytics"
              priority
            />
          </div>
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-7 px-8 rounded-full shadow-md hover:shadow-lg transition-shadow duration-150 ease-in-out transform hover:scale-105">
            <Link href="/create">
              Create Your First Poll <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
