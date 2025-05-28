'use client';

import type { Poll, Question, VoteData } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { submitVoteAction, getPollAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2, AlertTriangle } from 'lucide-react';

interface VotingFormProps {
  pollId: string;
}

export default function VotingForm({ pollId }: VotingFormProps) {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, string>>({}); // { questionId: optionId/responseText }
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    async function fetchPoll() {
      setIsLoading(true);
      setError(null);
      const fetchedPoll = await getPollAction(pollId);
      if (fetchedPoll) {
        setPoll(fetchedPoll);
      } else {
        setError('Poll not found or it may have expired.');
        toast({
          title: 'Error',
          description: 'Could not load the poll. It might not exist or has expired.',
          variant: 'destructive',
        });
      }
      setIsLoading(false);
    }
    fetchPoll();
  }, [pollId, toast]);

  const handleVoteChange = (questionId: string, value: string) => {
    setVotes(prev => ({ ...prev, [questionId]: value }));
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!poll) return;
    setIsSubmitting(true);

    const votesData: VoteData[] = poll.questions.map(q => {
      const value = votes[q.id];
      if (q.type === 'multiple-choice') {
        return { questionId: q.id, optionId: value };
      }
      return { questionId: q.id, responseText: value };
    }).filter(vote => vote.optionId || (vote.responseText && vote.responseText.trim() !== '')); // Ensure some vote is cast

    if (votesData.length === 0) {
      toast({
        title: "No votes cast",
        description: "Please select an option or enter text for at least one question.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    
    const result = await submitVoteAction(pollId, votesData);

    if (result.success) {
      toast({
        title: 'Vote Submitted!',
        description: 'Thank you for your participation.',
      });
      router.push(`/results/${pollId}`);
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to submit vote.',
        variant: 'destructive',
      });
    }
    setIsSubmitting(false);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-xl">Loading poll...</p>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <Card className="w-full max-w-md mx-auto text-center shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-destructive flex items-center justify-center">
            <AlertTriangle className="mr-2 h-8 w-8" /> Poll Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg">{error || 'Could not load the poll.'}</p>
          <Button onClick={() => router.push('/')} className="mt-6">Go Home</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-3xl text-primary">{poll.title}</CardTitle>
        <CardDescription>Cast your vote below. Your response is valuable!</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {poll.questions.map((question: Question) => (
            <div key={question.id} className="p-4 border border-border rounded-lg bg-card shadow-sm">
              <Label className="text-xl font-semibold mb-3 block">{question.text}</Label>
              {question.type === 'multiple-choice' && question.options && (
                <RadioGroup
                  onValueChange={(value) => handleVoteChange(question.id, value)}
                  value={votes[question.id]}
                  className="space-y-2"
                >
                  {question.options.map(option => (
                    <div key={option.id} className="flex items-center space-x-3 p-3 rounded-md hover:bg-secondary/50 transition-colors border border-input">
                      <RadioGroupItem value={option.id} id={`${question.id}-${option.id}`} className="border-primary text-primary focus:ring-primary"/>
                      <Label htmlFor={`${question.id}-${option.id}`} className="text-base cursor-pointer flex-grow">{option.text}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
              {question.type === 'free-text' && (
                <Textarea
                  placeholder="Type your response here..."
                  onChange={(e) => handleVoteChange(question.id, e.target.value)}
                  value={votes[question.id] || ''}
                  className="min-h-[100px] text-base"
                />
              )}
            </div>
          ))}
          <CardFooter className="p-0 pt-6">
            <Button type="submit" className="w-full text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting...
                </>
              ) : (
                'Submit Vote'
              )}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
