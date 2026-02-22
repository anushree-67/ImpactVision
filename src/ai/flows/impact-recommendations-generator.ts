'use server';
/**
 * @fileOverview A Genkit flow to generate actionable recommendations based on simulated impact data.
 *
 * - generateImpactRecommendations - A function that handles the recommendation generation process.
 * - ImpactRecommendationsGeneratorInput - The input type for the generateImpactRecommendations function.
 * - ImpactRecommendationsGeneratorOutput - The return type for the generateImpactRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StructuredInputSchema = z.object({
  category: z.string().describe('The category of the decision (e.g., health, finance, career).'),
  action: z.string().describe('The action taken (e.g., sleep, spend, learn).'),
  amount: z.union([z.number(), z.string()]).optional().describe('The amount associated with the action.'),
  duration: z.string().optional().describe('The duration associated with the action (e.g., hours, minutes).'),
  frequency: z.string().describe('How often the action occurs (e.g., daily, weekly, monthly).'),
  unit: z.string().optional().describe('The unit of the amount, if applicable (e.g., $, hours).'),
});

const MetricsByHorizonItemSchema = z.object({
  horizonDays: z.number().describe('The number of days for this simulation horizon.'),
  healthScore: z.number().describe('The projected health score (0-100).'),
  moneyDelta: z.number().describe('The projected financial change (cost/savings).'),
  skillScore: z.number().describe('The projected career/skill score (0-100).'),
  riskLevel: z.union([
    z.literal('LOW'),
    z.literal('MEDIUM'),
    z.literal('HIGH'),
  ]).describe('The overall risk level for this horizon.'),
  explanation: z.string().describe('A detailed explanation of the impact for this horizon.'),
});

export const ImpactRecommendationsGeneratorInputSchema = z.object({
  structuredInput: StructuredInputSchema.describe('The parsed user decision.'),
  metricsByHorizon: z.array(MetricsByHorizonItemSchema).describe('An array of simulation results for different time horizons.'),
});
export type ImpactRecommendationsGeneratorInput = z.infer<typeof ImpactRecommendationsGeneratorInputSchema>;

export const ImpactRecommendationsGeneratorOutputSchema = z.array(z.string()).describe('A list of 3-5 actionable, personalized recommendations.');
export type ImpactRecommendationsGeneratorOutput = z.infer<typeof ImpactRecommendationsGeneratorOutputSchema>;

export async function generateImpactRecommendations(input: ImpactRecommendationsGeneratorInput): Promise<ImpactRecommendationsGeneratorOutput> {
  return impactRecommendationsGeneratorFlow(input);
}

const recommendationsPrompt = ai.definePrompt({
  name: 'recommendationsPrompt',
  input: {schema: ImpactRecommendationsGeneratorInputSchema},
  output: {schema: ImpactRecommendationsGeneratorOutputSchema},
  prompt: `You are an AI assistant tasked with generating actionable, personalized recommendations based on a user's decision and its simulated impact.

User's Decision (Structured Input):
  Category: {{{structuredInput.category}}}
  Action: {{{structuredInput.action}}}
  {{#if structuredInput.amount}}Amount: {{{structuredInput.amount}}}{{#if structuredInput.unit}} {{{structuredInput.unit}}}{{/if}}{{/if}}
  {{#if structuredInput.duration}}Duration: {{{structuredInput.duration}}}{{/if}}
  Frequency: {{{structuredInput.frequency}}}

Simulated Impacts Across Horizons:
{{#each metricsByHorizon}}
  - Horizon: {{this.horizonDays}} days
    Health Score: {{this.healthScore}}/100
    Financial Impact: {{this.moneyDelta}} (delta)
    Skill Score: {{this.skillScore}}/100
    Risk Level: {{this.riskLevel}}
    Explanation: {{this.explanation}}
{{/each}}

Based on the user's decision and the detailed simulated impacts provided above, generate 3 to 5 actionable, personalized recommendations.
Each recommendation should:
1. Clearly state the recommendation.
2. Explain the rationale behind the projected impact (positive or negative).
3. Suggest specific ways to mitigate identified risks or enhance positive outcomes.

Provide the recommendations as a JSON array of strings.`,
});

const impactRecommendationsGeneratorFlow = ai.defineFlow(
  {
    name: 'impactRecommendationsGeneratorFlow',
    inputSchema: ImpactRecommendationsGeneratorInputSchema,
    outputSchema: ImpactRecommendationsGeneratorOutputSchema,
  },
  async (input) => {
    const {output} = await recommendationsPrompt(input);
    return output!;
  }
);
