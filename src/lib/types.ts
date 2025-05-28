export interface SentimentAnalysisResult {
  text: string;
  sentiment: string;
  isPotentiallyProblematic: boolean;
  moderationNotes?: string;
}

export interface Option {
  id: string;
  text: string;
  votes: number;
}

export interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'free-text';
  options?: Option[]; // Only for multiple-choice questions
  responses?: string[]; // Only for free-text questions, stores raw text responses
  sentiments?: SentimentAnalysisResult[]; // Stores sentiment analysis for free-text responses
}

export interface Poll {
  id: string;
  title: string;
  questions: Question[];
  createdAt: number; // Unix timestamp for TTL
}

// Used for form data when creating a poll
export interface QuestionFormData {
  id: string; // for client-side keying
  text: string;
  type: 'multiple-choice' | 'free-text';
  options: { id: string; text: string }[]; // options only relevant for multiple-choice
}

// Used for submitting votes
export interface VoteData {
  questionId: string;
  optionId?: string; // For multiple-choice
  responseText?: string; // For free-text
}

export interface DashboardStats {
  totalActivePolls: number;
  totalVotesCast: number;
  recentPolls: { id: string; title: string }[];
}
