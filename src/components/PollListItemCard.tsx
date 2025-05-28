'use client';

import type { Poll } from '@/lib/types';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart2, Edit3, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState, useEffect } from 'react';

interface PollListItemCardProps {
  poll: Poll;
}

export default function PollListItemCard({ poll }: PollListItemCardProps) {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    setTimeAgo(formatDistanceToNow(new Date(poll.createdAt), { addSuffix: true }));
    // Update time every minute for active display
    const interval = setInterval(() => {
       setTimeAgo(formatDistanceToNow(new Date(poll.createdAt), { addSuffix: true }));
    }, 60000);
    return () => clearInterval(interval);
  }, [poll.createdAt]);


  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-150 ease-in-out">
      <CardHeader>
        <CardTitle className="text-xl text-primary">{poll.title}</CardTitle>
        <CardDescription className="text-sm flex items-center text-muted-foreground">
          <Clock className="mr-1.5 h-4 w-4" />
          Created {timeAgo} &bull; {poll.questions.length} question{poll.questions.length === 1 ? '' : 's'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {/* You could add a snippet of the first question or other details here if desired */}
        <p className="text-sm text-foreground/80 line-clamp-2">
          {poll.questions[0]?.text || 'This poll is ready for votes.'}
        </p>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2 p-4 border-t border-border">
        <Button variant="outline" asChild size="sm">
          <Link href={`/results/${poll.id}`}>
            <BarChart2 className="mr-2 h-4 w-4" /> Results
          </Link>
        </Button>
        <Button variant="default" asChild size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href={`/vote/${poll.id}`}>
            <Edit3 className="mr-2 h-4 w-4" /> Vote
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
