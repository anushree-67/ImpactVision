
import { DecisionParserOutput } from "@/ai/flows/simulate-decision-parser";

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface MetricsHorizon {
  horizonDays: number;
  healthScore: number;
  moneyDelta: number;
  skillScore: number;
  riskLevel: RiskLevel;
  explanation: string;
}

export function runSimulationLogic(parsed: DecisionParserOutput): MetricsHorizon[] {
  const horizons = [30, 180, 365, 1825]; // 1m, 6m, 1y, 5y
  
  return horizons.map(days => {
    let healthScore = 75; // Baseline
    let moneyDelta = 0;
    let skillScore = 50; // Baseline
    
    const { category, action, value, unit, frequency } = parsed;
    
    // Frequency Multiplier (normalized to per day)
    let freqMultiplier = 1;
    if (frequency.includes('daily') || frequency.includes('day')) freqMultiplier = 1;
    else if (frequency.includes('weekly') || frequency.includes('week')) freqMultiplier = 1/7;
    else if (frequency.includes('monthly') || frequency.includes('month')) freqMultiplier = 1/30;
    else if (frequency.includes('yearly') || frequency.includes('annually')) freqMultiplier = 1/365;

    const totalOccurrences = days * freqMultiplier;

    if (category === 'health') {
      if (action.includes('sleep')) {
        // Assume 8 is ideal.
        const diff = value - 8;
        healthScore += (diff * 2) * (days / 30);
      } else if (action.includes('exercise') || action.includes('run')) {
        healthScore += (value * 0.5) * totalOccurrences;
      } else if (action.includes('smoke') || action.includes('drink')) {
        healthScore -= (value * 1.5) * totalOccurrences;
      }
    } else if (category === 'finance') {
      if (action.includes('spend') || action.includes('buy') || action.includes('coffee')) {
        moneyDelta -= value * totalOccurrences;
        healthScore -= (value > 100 ? 1 : 0.1) * (days / 365); // Minor stress factor
      } else if (action.includes('save') || action.includes('invest')) {
        moneyDelta += value * totalOccurrences * (1 + (0.07 * (days/365))); // Simple 7% annual growth simulation
      }
    } else if (category === 'career') {
      if (action.includes('study') || action.includes('learn') || action.includes('read')) {
        skillScore += (value * 0.1) * totalOccurrences;
        moneyDelta -= (value * 0.5) * totalOccurrences; // Opportunity cost or book costs
      } else if (action.includes('work') && action.includes('overtime')) {
        skillScore += (value * 0.05) * totalOccurrences;
        moneyDelta += (value * 20) * totalOccurrences; // Assume overtime pay
        healthScore -= (value * 0.2) * totalOccurrences; // Stress impact
      }
    }

    // Clamp values
    healthScore = Math.max(0, Math.min(100, healthScore));
    skillScore = Math.max(0, Math.min(100, skillScore));

    // Determine Risk
    let riskLevel: RiskLevel = 'LOW';
    if (healthScore < 40 || moneyDelta < -100000) riskLevel = 'HIGH';
    else if (healthScore < 60 || moneyDelta < -10000) riskLevel = 'MEDIUM';

    const explanation = generateExplanation(parsed, days, healthScore, moneyDelta, skillScore);

    return {
      horizonDays: days,
      healthScore: Math.round(healthScore),
      moneyDelta: Math.round(moneyDelta),
      skillScore: Math.round(skillScore),
      riskLevel,
      explanation
    };
  });
}

function generateExplanation(parsed: DecisionParserOutput, days: number, health: number, money: number, skill: number): string {
  const timeFrame = days >= 365 ? `${Math.round(days/365)} year(s)` : `${days} days`;
  return `In ${timeFrame}, your habit of "${parsed.description}" will result in a health score of ${Math.round(health)}/100 and a financial impact of ${money.toLocaleString()} ${parsed.unit}. Your skill development is projected at ${Math.round(skill)}/100.`;
}
