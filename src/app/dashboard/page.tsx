
import { getDashboardStatsAction } from '@/app/actions';
import StatCard from '@/components/StatCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ListChecks, BarChartHorizontalBig, Activity, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns'; // For displaying time ago if needed

export const metadata = {
  title: 'Dashboard - QuickPoll',
  description: 'View performance statistics for QuickPoll.',
};

export default async function DashboardPage() {
  const stats = await getDashboardStatsAction();

  if (!stats) {
    return (
      <div className="py-8">
        <Card className="text-center py-12 shadow-md">
          <CardContent>
            <p className="text-xl text-muted-foreground mb-6">Could not load dashboard statistics.</p>
            <Button asChild size="lg">
              <Link href="/">Go Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl text-primary flex items-center">
            <Activity className="mr-3 h-8 w-8" />
            QuickPoll Dashboard
          </CardTitle>
          <CardDescription>Overview of poll activity and performance. Polls are active for 30 minutes.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="Total Active Polls"
          value={stats.totalActivePolls.toString()}
          icon={<ListChecks className="h-8 w-8 text-primary" />}
          description="Number of polls currently accepting votes."
        />
        <StatCard
          title="Total Votes Cast"
          value={stats.totalVotesCast.toString()}
          icon={<BarChartHorizontalBig className="h-8 w-8 text-accent" />}
          description="Total votes submitted across all active polls."
        />
      </div>
      
      {stats.recentPolls && stats.recentPolls.length > 0 && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Recently Created Polls</CardTitle>
            <CardDescription>A quick look at the latest polls added.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {stats.recentPolls.map(poll => (
                <li key={poll.id} className="p-3 border rounded-md hover:bg-secondary/30 transition-colors">
                  <Link href={`/results/${poll.id}`} className="block group">
                    <h4 className="font-semibold text-md group-hover:text-primary">{poll.title}</h4>
                    <p className="text-xs text-muted-foreground">ID: {poll.id}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
