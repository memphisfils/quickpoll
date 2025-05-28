
import { getAllActivePollsAction } from '@/app/actions';
import PollListItemCard from '@/components/PollListItemCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export const metadata = {
  title: 'Active Polls - QuickPoll',
  description: 'Browse all active polls on QuickPoll.',
};

export default async function ActivePollsPage() {
  const polls = await getAllActivePollsAction();

  return (
    <div className="py-8">
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl text-primary flex items-center">
            <FileQuestion className="mr-3 h-8 w-8" />
            Active Polls
          </CardTitle>
          <CardDescription>Browse and participate in currently active polls. Polls are available for 30 minutes after creation.</CardDescription>
        </CardHeader>
      </Card>

      {polls.length === 0 ? (
        <Card className="text-center py-12 shadow-md">
          <CardContent>
            <p className="text-xl text-muted-foreground mb-6">No active polls at the moment.</p>
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/create">Create a New Poll</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {polls.map(poll => (
            <PollListItemCard key={poll.id} poll={poll} />
          ))}
        </div>
      )}
    </div>
  );
}
