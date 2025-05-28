'use client';

import type { Poll, Question, SentimentAnalysisResult } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getPollAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2, AlertTriangle, Share2, RefreshCw, Smile, Meh, Frown, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from "@/components/ui/progress";

interface ResultsDisplayProps {
  pollId: string;
}

const POSITIVE_COLOR = "hsl(var(--chart-1))"; // Blue (primary)
const NEGATIVE_COLOR = "hsl(var(--destructive))"; // Red
const NEUTRAL_COLOR = "hsl(var(--muted-foreground))"; // Gray
const PROBLEMATIC_COLOR = "hsl(var(--accent))"; // Orange (accent)

const getSentimentIcon = (sentiment: string) => {
  const lowerSentiment = sentiment.toLowerCase();
  if (lowerSentiment.includes('positive')) return <Smile className="h-5 w-5 text-green-500" />;
  if (lowerSentiment.includes('negative')) return <Frown className="h-5 w-5 text-red-500" />;
  if (lowerSentiment.includes('neutral')) return <Meh className="h-5 w-5 text-gray-500" />;
  return <AlertCircle className="h-5 w-5 text-yellow-500" />; // For errors or unknown
};

export default function ResultsDisplay({ pollId }: ResultsDisplayProps) {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const fetchPollResults = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const fetchedPoll = await getPollAction(pollId);
    if (fetchedPoll) {
      setPoll(fetchedPoll);
    } else {
      setError('Poll results not found or the poll may have expired.');
       toast({
        title: 'Error',
        description: 'Could not load poll results. It might not exist or has expired.',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  }, [pollId, toast]);

  useEffect(() => {
    fetchPollResults();
  }, [fetchPollResults]);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: `${type} Link Copied!`, description: 'The link has been copied to your clipboard.' });
    }).catch(err => {
      toast({ title: 'Copy Failed', description: 'Could not copy the link.', variant: 'destructive' });
    });
  };
  
  const shareVoteLink = () => {
    const url = `${window.location.origin}/vote/${pollId}`;
    copyToClipboard(url, 'Vote');
  };

  const shareResultsLink = () => {
    const url = window.location.href;
    copyToClipboard(url, 'Results');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-xl">Loading results...</p>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <Card className="w-full max-w-md mx-auto text-center shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-destructive flex items-center justify-center">
            <AlertTriangle className="mr-2 h-8 w-8" /> Results Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg">{error || 'Could not load poll results.'}</p>
          <Button onClick={() => router.push('/')} className="mt-6">Go Home</Button>
        </CardContent>
      </Card>
    );
  }
  
  const totalVotesPerMcQuestion = (question: Question) => question.options?.reduce((sum, opt) => sum + opt.votes, 0) || 0;

  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-3xl text-primary">{poll.title}</CardTitle>
              <CardDescription>Here are the current results for your poll.</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={shareVoteLink}><Share2 className="mr-2 h-4 w-4" /> Share Vote Link</Button>
              <Button variant="outline" onClick={shareResultsLink}><Share2 className="mr-2 h-4 w-4" /> Share Results Link</Button>
              <Button variant="ghost" size="icon" onClick={fetchPollResults} aria-label="Refresh results"><RefreshCw className="h-5 w-5" /></Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {poll.questions.map((question, index) => (
        <Card key={question.id} className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Question {index + 1}: {question.text}</CardTitle>
          </CardHeader>
          <CardContent>
            {question.type === 'multiple-choice' && question.options && (
              <>
                {totalVotesPerMcQuestion(question) > 0 ? (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={question.options} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="text" tick={{ fill: 'hsl(var(--foreground))' }} />
                        <YAxis allowDecimals={false} tick={{ fill: 'hsl(var(--foreground))' }} />
                        <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} itemStyle={{ color: 'hsl(var(--foreground))' }} />
                        <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
                        <Bar dataKey="votes" name="Votes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                           {question.options.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={idx % 2 === 0 ? "hsl(var(--primary))" : "hsl(var(--accent))"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                   <p className="text-muted-foreground">No votes yet for this question.</p>
                )}
                <div className="mt-6 space-y-2">
                  {question.options.map(opt => {
                    const totalVotes = totalVotesPerMcQuestion(question);
                    const percentage = totalVotes > 0 ? (opt.votes / totalVotes) * 100 : 0;
                    return (
                      <div key={opt.id}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">{opt.text}</span>
                          <span className="text-sm text-muted-foreground">{opt.votes} vote{opt.votes === 1 ? '' : 's'} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <Progress value={percentage} className="h-2 [&>div]:bg-primary" />
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            {question.type === 'free-text' && (
              <div className="space-y-4">
                {question.responses && question.responses.length > 0 ? (
                  <>
                    <h4 className="font-semibold text-md">Responses & Sentiments:</h4>
                    {question.sentiments && question.sentiments.map((sentiment, sIndex) => (
                      <Card key={sIndex} className={`p-3 ${sentiment.isPotentiallyProblematic ? 'border-destructive bg-destructive/10' : 'bg-secondary/30'}`}>
                        <div className="flex justify-between items-start">
                          <p className="text-sm italic">"{sentiment.text}"</p>
                          {getSentimentIcon(sentiment.sentiment)}
                        </div>
                        <div className="mt-1 text-xs">
                          <Badge variant={sentiment.isPotentiallyProblematic ? 'destructive' : 'secondary'}>
                            Sentiment: {sentiment.sentiment}
                          </Badge>
                          {sentiment.isPotentiallyProblematic && (
                             <Badge variant="destructive" className="ml-2">Potentially Problematic</Badge>
                          )}
                        </div>
                        {sentiment.isPotentiallyProblematic && sentiment.moderationNotes && (
                          <p className="mt-1 text-xs text-destructive"><span className="font-semibold">Moderation Notes:</span> {sentiment.moderationNotes}</p>
                        )}
                      </Card>
                    ))}
                    {!question.sentiments || question.sentiments.length < question.responses.length && (
                        <p className="text-xs text-muted-foreground">Some responses may still be undergoing sentiment analysis.</p>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground">No free-text responses yet for this question.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
