'use server';

/**
 * @fileOverview Sentiment analysis for free-text poll responses.
 *
 * - analyzeSentiment - Analyzes the sentiment of a given text.
 * - AnalyzeSentimentInput - The input type for the analyzeSentiment function.
 * - AnalyzeSentimentOutput - The return type for the analyzeSentiment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSentimentInputSchema = z.object({
  text: z.string().describe('The text to analyze for sentiment.'),
});
export type AnalyzeSentimentInput = z.infer<typeof AnalyzeSentimentInputSchema>;

const AnalyzeSentimentOutputSchema = z.object({
  sentiment: z
    .string()
    .describe(
      'The sentiment of the text (positive, negative, or neutral), and the reasoning behind it.'
    ),
  isPotentiallyProblematic: z
    .boolean()
    .describe('Whether the content is potentially problematic or inappropriate.'),
  moderationNotes: z
    .string()
    .optional()
    .describe('Additional notes for the moderator, if any.'),
});
export type AnalyzeSentimentOutput = z.infer<typeof AnalyzeSentimentOutputSchema>;

export async function analyzeSentiment(input: AnalyzeSentimentInput): Promise<AnalyzeSentimentOutput> {
  return analyzeSentimentFlow(input);
}

const analyzeSentimentPrompt = ai.definePrompt({
  name: 'analyzeSentimentPrompt',
  input: {schema: AnalyzeSentimentInputSchema},
  output: {schema: AnalyzeSentimentOutputSchema},
  prompt: `Analyze the sentiment of the following text and determine if it is potentially problematic or inappropriate.\n\nText: {{{text}}}\n\nConsider factors such as hate speech, offensive language, harassment, and overall negativity. Provide a sentiment analysis (positive, negative, or neutral) and indicate whether the content is potentially problematic. Include specific moderation notes if necessary.\n\nYou must set the isPotentiallyProblematic output field to true if the text contains potentially problematic content and provide moderation notes, otherwise set it to false.\n`,
});

const analyzeSentimentFlow = ai.defineFlow(
  {
    name: 'analyzeSentimentFlow',
    inputSchema: AnalyzeSentimentInputSchema,
    outputSchema: AnalyzeSentimentOutputSchema,
  },
  async input => {
    const {output} = await analyzeSentimentPrompt(input);
    return output!;
  }
);
