/**
 * @fileOverview Rule-based parser for identifying habits and metrics in natural language.
 */

export interface ParsedRules {
  category: 'health' | 'finance' | 'career';
  action: string;
  value: number;
  unit: string;
  frequency: string;
}

export function parseDecisionWithRules(text: string): ParsedRules {
  const lowerText = text.toLowerCase();
  
  // Default values
  let category: 'health' | 'finance' | 'career' = 'health';
  let action = 'activity';
  let value = 0;
  let unit = 'units';
  let frequency = 'daily';

  // Category detection
  if (lowerText.match(/spend|save|invest|₹|dollar|money|cost/)) {
    category = 'finance';
  } else if (lowerText.match(/study|learn|read|work|skill|career/)) {
    category = 'career';
  }

  // Value and Unit extraction (basic regex)
  const amountMatch = lowerText.match(/(\d+(?:\.\d+)?)\s*(hours?|mins?|minutes?|₹|dollars?|times?|grams?|kg)/);
  if (amountMatch) {
    value = parseFloat(amountMatch[1]);
    unit = amountMatch[2];
  }

  // Frequency detection
  if (lowerText.includes('weekly') || lowerText.includes('week')) frequency = 'weekly';
  else if (lowerText.includes('monthly') || lowerText.includes('month')) frequency = 'monthly';
  else if (lowerText.includes('yearly') || lowerText.includes('year')) frequency = 'yearly';

  // Action detection
  const actions = ['sleep', 'run', 'exercise', 'spend', 'save', 'study', 'work', 'eat', 'smoke', 'drink'];
  for (const a of actions) {
    if (lowerText.includes(a)) {
      action = a;
      break;
    }
  }

  return { category, action, value, unit, frequency };
}
