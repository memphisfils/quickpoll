import type { Poll, Question, Option, VoteData, SentimentAnalysisResult } from './types';
import { analyzeSentiment, type AnalyzeSentimentOutput } from '@/ai/flows/analyze-poll-response-sentiment';

const polls = new Map<string, Poll>();
const POLL_TTL_MS = 30 * 60 * 1000; // 30 minutes

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

// Simple periodic cleanup
setInterval(() => {
  const now = Date.now();
  for (const [id, poll] of polls.entries()) {
    if (now - poll.createdAt > POLL_TTL_MS) {
      polls.delete(id);
      console.log(`Poll ${id} expired and removed.`);
    }
  }
}, 60 * 1000); // Check every minute

export async function createPollInStore(
  title: string,
  questionsData: { text: string; type: 'multiple-choice' | 'free-text'; options?: string[] }[]
): Promise<Poll> {
  const id = generateId();
  const questions: Question[] = questionsData.map((qData, index) => {
    const questionId = `q-${index}-${generateId()}`;
    return {
      id: questionId,
      text: qData.text,
      type: qData.type,
      options: qData.type === 'multiple-choice'
        ? qData.options?.map((optText, optIndex) => ({
            id: `opt-${optIndex}-${generateId()}`,
            text: optText,
            votes: 0,
          })) || []
        : undefined,
      responses: qData.type === 'free-text' ? [] : undefined,
      sentiments: qData.type === 'free-text' ? [] : undefined,
    };
  });

  const newPoll: Poll = {
    id,
    title,
    questions,
    createdAt: Date.now(),
  };
  polls.set(id, newPoll);
  return newPoll;
}

export async function getPollFromStore(id: string): Promise<Poll | undefined> {
  const poll = polls.get(id);
  if (poll) {
    if (Date.now() - poll.createdAt > POLL_TTL_MS) {
      polls.delete(id);
      console.log(`Poll ${id} expired and removed upon access.`);
      return undefined;
    }
    // Return a deep copy to prevent direct modification of the stored object
    return JSON.parse(JSON.stringify(poll));
  }
  return undefined;
}

export async function submitVoteToStore(
  pollId: string,
  votesData: VoteData[]
): Promise<{ success: boolean; error?: string; updatedPoll?: Poll }> {
  const poll = polls.get(pollId);
  if (!poll) {
    return { success: false, error: 'Poll not found or expired.' };
  }

  if (Date.now() - poll.createdAt > POLL_TTL_MS) {
    polls.delete(pollId);
    return { success: false, error: 'Poll has expired.' };
  }

  // Work on a copy of questions to update
  const updatedQuestions = poll.questions.map(q => ({ ...q, options: q.options?.map(o => ({...o})), responses: q.responses ? [...q.responses] : [], sentiments: q.sentiments ? [...q.sentiments] : [] }));

  for (const vote of votesData) {
    const question = updatedQuestions.find(q => q.id === vote.questionId);
    if (!question) {
      console.warn(`Question ID ${vote.questionId} not found in poll ${pollId}`);
      continue;
    }

    if (question.type === 'multiple-choice' && vote.optionId) {
      if (!question.options) question.options = [];
      const option = question.options.find(o => o.id === vote.optionId);
      if (option) {
        option.votes += 1;
      } else {
         console.warn(`Option ID ${vote.optionId} not found for question ${question.id}`);
      }
    } else if (question.type === 'free-text' && typeof vote.responseText === 'string') {
      question.responses = question.responses || [];
      question.responses.push(vote.responseText);

      question.sentiments = question.sentiments || [];
      try {
        const sentimentResult: AnalyzeSentimentOutput = await analyzeSentiment({ text: vote.responseText });
        question.sentiments.push({
          text: vote.responseText,
          sentiment: sentimentResult.sentiment,
          isPotentiallyProblematic: sentimentResult.isPotentiallyProblematic,
          moderationNotes: sentimentResult.moderationNotes,
        });
      } catch (error) {
        console.error('Error analyzing sentiment for response:', vote.responseText, error);
        question.sentiments.push({
          text: vote.responseText,
          sentiment: 'Analysis Error',
          isPotentiallyProblematic: false,
          moderationNotes: 'Could not analyze sentiment due to an internal error.',
        });
      }
    }
  }
  
  const updatedPollData = { ...poll, questions: updatedQuestions };
  polls.set(pollId, updatedPollData);

  return { success: true, updatedPoll: JSON.parse(JSON.stringify(updatedPollData)) };
}
