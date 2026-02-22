
'use server';

import { parseDecision } from "@/ai/flows/simulate-decision-parser";
import { generateImpactRecommendations } from "@/ai/flows/impact-recommendations-generator";
import { runSimulationLogic } from "@/lib/simulation-engine";

export async function runSimulationAction(rawText: string) {
  try {
    // 1. Parse Input using GenAI
    const structuredInput = await parseDecision({ rawDecisionText: rawText });

    // 2. Run Deterministic Simulation
    const metricsByHorizon = runSimulationLogic(structuredInput);

    // 3. Generate Recommendations using GenAI
    const recommendations = await generateImpactRecommendations({
      structuredInput: {
        category: structuredInput.category,
        action: structuredInput.action,
        amount: structuredInput.value,
        frequency: structuredInput.frequency,
        unit: structuredInput.unit,
        duration: structuredInput.unit.includes('hour') || structuredInput.unit.includes('min') ? `${structuredInput.value} ${structuredInput.unit}` : undefined
      },
      metricsByHorizon: metricsByHorizon.map(m => ({
        ...m,
        explanation: m.explanation
      }))
    });

    return {
      success: true,
      structuredInput,
      metricsByHorizon,
      recommendations
    };
  } catch (error: any) {
    console.error("Simulation error:", error);
    return { success: false, error: error.message };
  }
}
