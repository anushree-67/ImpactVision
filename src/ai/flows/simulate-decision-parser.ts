'use server';
/**
 * @fileOverview A Genkit flow for parsing natural language decisions or habits into a structured format.
 *
 * - parseDecision - A function that handles the parsing process.
 * - DecisionParserInput - The input type for the parseDecision function.
 * - DecisionParserOutput - The return type for the parseDecision function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DecisionParserInputSchema = z.object({
  rawDecisionText: z.string().describe('The user-entered habit or decision in natural language.'),
});
export type DecisionParserInput = z.infer<typeof DecisionParserInputSchema>;

const DecisionParserOutputSchema = z.object({
  category: z.enum(['health', 'finance', 'career']).describe('The category of the decision: health, finance, or career.'),
  action: z.string().describe('The main action or activity being described, e.g., "sleep", "spend", "exercise".'),
  value: z.number().describe('The numerical amount or duration associated with the action.'),
  unit: z.string().describe('The unit for the value, e.g., "hours", "₹", "dollars", "minutes", "times", "grams".'),
  frequency: z.string().describe('How often the action occurs, e.g., "daily", "weekly", "monthly", "annually", "per day", "a week".'),
  description: z.string().describe('A brief, concise rephrasing of the parsed decision.')
});
export type DecisionParserOutput = z.infer<typeof DecisionParserOutputSchema>;

export async function parseDecision(input: DecisionParserInput): Promise<DecisionParserOutput> {
  return parseDecisionFlow(input);
}

const parseDecisionPrompt = ai.definePrompt({
  name: 'parseDecisionPrompt',
  input: { schema: DecisionParserInputSchema },
  output: { schema: DecisionParserOutputSchema },
  prompt: `You are an expert natural language parser for decisions and habits.
Your task is to parse the user's input into a structured JSON object.
Extract the following fields accurately:
- 'category': Must be one of 'health', 'finance', or 'career'. Determine this based on the common implications of the decision.
- 'action': The main verb or activity described.
- 'value': The numerical amount or duration involved.
- 'unit': The unit corresponding to the value (e.g., "hours", "₹", "dollars", "minutes", "grams", "times").
- 'frequency': How often the action occurs (e.g., "daily", "weekly", "monthly", "annually", "per day", "a week").
- 'description': A brief, concise rephrasing of the decision.

Here are some examples:
Input: "sleep 4 hours daily"
Output: { "category": "health", "action": "sleep", "value": 4, "unit": "hours", "frequency": "daily", "description": "Sleeping 4 hours daily." }

Input: "spend ₹200/day on coffee"
Output: { "category": "finance", "action": "spend", "value": 200, "unit": "₹", "frequency": "daily", "description": "Spending ₹200 daily on coffee." }

Input: "exercise 3 times a week"
Output: { "category": "health", "action": "exercise", "value": 3, "unit": "times", "frequency": "weekly", "description": "Exercising 3 times a week." }

Input: "read 30 minutes every morning for career growth"
Output: { "category": "career", "action": "read", "value": 30, "unit": "minutes", "frequency": "daily", "description": "Reading 30 minutes every morning for career growth." }

Input: "take cold showers once a day"
Output: { "category": "health", "action": "take cold showers", "value": 1, "unit": "time", "frequency": "daily", "description": "Taking cold showers once a day." }

Input: "save $500 monthly"
Output: { "category": "finance", "action": "save", "value": 500, "unit": "dollars", "frequency": "monthly", "description": "Saving $500 monthly." }

Input: "work 10 hours overtime weekly"
Output: { "category": "career", "action": "work overtime", "value": 10, "unit": "hours", "frequency": "weekly", "description": "Working 10 hours overtime weekly." }

Now, parse the following decision:
Decision: {{{rawDecisionText}}}`,
});

const parseDecisionFlow = ai.defineFlow(
  {
    name: 'parseDecisionFlow',
    inputSchema: DecisionParserInputSchema,
    outputSchema: DecisionParserOutputSchema,
  },
  async (input) => {
    const { output } = await parseDecisionPrompt(input);
    if (!output) {
      throw new Error('Failed to parse decision: no output from prompt.');
    }
    return output;
  }
);
