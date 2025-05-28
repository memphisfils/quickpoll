import type { Poll, Question, Option, VoteData, SentimentAnalysisResult, DashboardStats } from './types';
import { analyzeSentiment, type AnalyzeSentimentOutput } from '@/ai/flows/analyze-poll-response-sentiment';

const polls = new Map<string, Poll>();
const POLL_TTL_MS = 30 * 60 * 1000; // 30 minutes

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function isPollExpired(poll: Poll): boolean {
  return Date.now() - poll.createdAt > POLL_TTL_MS;
}

// Simple periodic cleanup
setInterval(() => {
  const now = Date.now();
  for (const [id, poll] of polls.entries()) {
    if (now - poll.createdAt > POLL_TTL_MS) {
      polls.delete(id);
      console.log(`Poll ${id} expired and removed by cleanup job.`);
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
    if (isPollExpired(poll)) {
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

  if (isPollExpired(poll)) {
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

export async function getAllActivePollsFromStore(): Promise<Poll[]> {
  const activePolls: Poll[] = [];
  const now = Date.now();
  for (const [id, poll] of polls.entries()) {
    if (now - poll.createdAt > POLL_TTL_MS) {
      polls.delete(id); // Eagerly delete expired poll
    } else {
      activePolls.push(JSON.parse(JSON.stringify(poll)));
    }
  }
  // Sort by creation date, newest first
  return activePolls.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getDashboardStatsFromStore(): Promise<DashboardStats> {
  let totalActivePolls = 0;
  let totalVotesCast = 0;
  const recentPollsRaw: Poll[] = [];
  const now = Date.now();

  for (const [id, poll] of polls.entries()) {
    if (now - poll.createdAt > POLL_TTL_MS) {
      polls.delete(id); // Eagerly delete expired poll
      continue;
    }
    totalActivePolls++;
    recentPollsRaw.push(poll);

    poll.questions.forEach(question => {
      if (question.type === 'multiple-choice' && question.options) {
        question.options.forEach(option => {
          totalVotesCast += option.votes;
        });
      } else if (question.type === 'free-text' && question.responses) {
        totalVotesCast += question.responses.length;
      }
    });
  }
  
  const recentPolls = recentPollsRaw
    .sort((a,b) => b.createdAt - a.createdAt)
    .slice(0, 5) // Get top 5 recent polls
    .map(p => ({id: p.id, title: p.title}));

  return {
    totalActivePolls,
    totalVotesCast,
    recentPolls,
  };
}
