
'use server';

import { createPollInStore, getPollFromStore, submitVoteToStore } from '@/lib/polls';
import type { Poll, QuestionFormData, VoteData } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

interface CreatePollResult {
  pollId?: string;
  error?: string;
}

export async function createPollAction(
  title: string,
  questions: QuestionFormData[]
): Promise<CreatePollResult> {
  if (!title.trim()) {
    return { error: 'Poll title cannot be empty.' };
  }
  if (questions.length === 0) {
    return { error: 'Poll must have at least one question.' };
  }
  for (const q of questions) {
    if (!q.text.trim()) {
      return { error: 'Question text cannot be empty.' };
    }
    if (q.type === 'multiple-choice' && q.options.length < 2) {
      return { error: `Question "${q.text}" must have at least two options.` };
    }
    if (q.type === 'multiple-choice') {
      for (const opt of q.options) {
        if(!opt.text.trim()) {
          return { error: `Option text cannot be empty for question "${q.text}".` };
        }
      }
    }
  }

  try {
    const questionsForStore = questions.map(q => ({
      text: q.text,
      type: q.type,
      options: q.type === 'multiple-choice' ? q.options.map(opt => opt.text) : undefined,
    }));
    const newPoll = await createPollInStore(title, questionsForStore);
    revalidatePath(`/results/${newPoll.id}`);
    revalidatePath(`/vote/${newPoll.id}`);
    return { pollId: newPoll.id };
  } catch (e) {
    console.error("Error creating poll:", e);
    return { error: 'Failed to create poll. Please try again.' };
  }
}

export async function getPollAction(pollId: string): Promise<Poll | null> {
  try {
    const poll = await getPollFromStore(pollId);
    return poll || null;
  } catch (e) {
    console.error(`Error fetching poll ${pollId}:`, e);
    return null;
  }
}

interface SubmitVoteResult {
  success: boolean;
  error?: string;
}

export async function submitVoteAction(pollId: string, votesData: VoteData[]): Promise<SubmitVoteResult> {
  if (votesData.length === 0) {
    return { success: false, error: "No votes submitted." };
  }
  try {
    const result = await submitVoteToStore(pollId, votesData);
    if (result.success) {
      revalidatePath(`/results/${pollId}`);
      return { success: true };
    }
    return { success: false, error: result.error || 'Failed to submit vote.' };
  } catch (e) {
    console.error(`Error submitting vote for poll ${pollId}:`, e);
    return { success: false, error: 'An unexpected error occurred while submitting your vote.' };
  }
}
