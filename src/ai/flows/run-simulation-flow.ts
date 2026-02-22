'use server';
/**
 * @fileOverview A consolidated Genkit flow for the Future-You Simulator.
 *
 * - runSimulation - The main function to parse input, simulate impact, and generate recommendations.
 * - RunSimulationInput - Input schema for the simulation.
 * - RunSimulationOutput - Output schema containing structured data and projections.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { parseDecision } from './simulate-decision-parser';
import { runSimulationLogic } from '@/lib/simulation-engine';
import { generateImpactRecommendations } from './impact-recommendations-generator';

const RunSimulationInputSchema = z.object({
  rawText: z.string().describe('The user-entered decision or habit.'),
});
export type RunSimulationInput = z.infer<typeof RunSimulationInputSchema>;

const MetricsByHorizonSchema = z.array(z.object({
  horizonDays: z.number(),
  healthScore: z.number(),
  moneyDelta: z.number(),
  skillScore: z.number(),
  riskLevel: z.string(),
  explanation: z.string(),
}));

const RunSimulationOutputSchema = z.object({
  structuredInput: z.any(),
  metricsByHorizon: MetricsByHorizonSchema,
  recommendations: z.array(z.string()),
  createdAt: z.string(),
});
export type RunSimulationOutput = z.infer<typeof RunSimulationOutputSchema>;

export async function runSimulation(input: RunSimulationInput): Promise<RunSimulationOutput> {
  return runSimulationFlow(input);
}

const runSimulationFlow = ai.defineFlow(
  {
    name: 'runSimulationFlow',
    inputSchema: RunSimulationInputSchema,
    outputSchema: RunSimulationOutputSchema,
  },
  async (input) => {
    // 1. Parse Input using GenAI
    const structuredInput = await parseDecision({ rawDecisionText: input.rawText });

    // 2. Run deterministic simulation logic
    const metricsByHorizon = runSimulationLogic(structuredInput);

    // 3. Generate actionable recommendations using GenAI
    const recommendations = await generateImpactRecommendations({
      structuredInput: {
        category: structuredInput.category,
        action: structuredInput.action,
        amount: structuredInput.value,
        frequency: structuredInput.frequency,
        unit: structuredInput.unit,
      },
      metricsByHorizon: metricsByHorizon.map(m => ({
        ...m,
        riskLevel: m.riskLevel as 'LOW' | 'MEDIUM' | 'HIGH',
        explanation: m.explanation
      }))
    });

    return {
      structuredInput,
      metricsByHorizon,
      recommendations,
      createdAt: new Date().toISOString(),
    };
  }
);
