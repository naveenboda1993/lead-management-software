/* eslint-disable @typescript-eslint/no-explicit-any */
import { Annotation, StateGraph } from "@langchain/langgraph";
import { createLLM } from "@/lib/ai/llm";

interface ActionSuggestion {
  action: string;
  priority: "high" | "medium" | "low";
  reason: string;
}

interface PredictionResult {
  winProbability: number;
  expectedRevenue: { value: number; confidenceInterval: { low: number; high: number } };
  suggestedActions: ActionSuggestion[];
  reasoning: string;
}

const ConversionPredictionState = Annotation.Root({
  dealHistory: Annotation<any[]>,
  leadProfile: Annotation<any>,
  industry: Annotation<string>,
  dealSize: Annotation<number>,
  stageDuration: Annotation<number>,
  engagementScore: Annotation<number>,
  winProbability: Annotation<number>,
  expectedRevenue: Annotation<any>,
  suggestedActions: Annotation<ActionSuggestion[]>,
  reasoning: Annotation<string>,
});

async function analyzeDealHistory(state: typeof ConversionPredictionState.State) {
  const llm = createLLM({ temperature: 0.2 });

  const prompt = `You are a deal analysis expert. Review this deal's history and extract key patterns.

Deal History: ${JSON.stringify(state.dealHistory)}
Lead Profile: ${JSON.stringify(state.leadProfile)}
Industry: ${state.industry}

Provide analysis as JSON: { "pattern_analysis": string (key observations from deal history), "strength_indicators": string[], "weakness_indicators": string[] }`;

  const _response = await llm.invoke(prompt);
  void _response;
  return {};
}

async function evaluateFactors(state: typeof ConversionPredictionState.State) {
  const llm = createLLM({ temperature: 0.3 });

  const prompt = `Evaluate the factors affecting this deal's conversion.

Lead Profile: ${JSON.stringify(state.leadProfile)}
Industry: ${state.industry}
Deal Size: $${state.dealSize}
Stage Duration: ${state.stageDuration} days
Engagement Score: ${state.engagementScore}/100

Provide analysis as JSON: {
  "factor_assessment": { "industry_fit": number (0-10), "deal_size_appropriateness": number (0-10), "engagement_quality": number (0-10), "stage_progression_speed": number (0-10) },
  "key_considerations": string[]
}`;

  const _response = await llm.invoke(prompt);
  void _response;
  return {};
}

async function predictOutcome(state: typeof ConversionPredictionState.State) {
  const llm = createLLM({ temperature: 0.3 });

  const prompt = `Predict the outcome of this deal based on all available data.

Lead Profile: ${JSON.stringify(state.leadProfile)}
Industry: ${state.industry}
Deal Size: $${state.dealSize}
Stage Duration: ${state.stageDuration} days
Engagement Score: ${state.engagementScore}/100
Deal History: ${JSON.stringify(state.dealHistory)}

Provide prediction as JSON: {
  "winProbability": number (0-1),
  "expectedRevenue": { "value": number, "confidenceInterval": { "low": number, "high": number } },
  "reasoning": string (detailed explanation of the prediction)
}

Consider:
- Industry conversion benchmarks
- Deal size relative to typical deals
- Engagement quality and frequency
- Stage progression speed (stalled deals are riskier)
- Historical patterns from deal history`;

  const response = await llm.invoke(prompt);
  const prediction = JSON.parse(response.content as string);

  return {
    winProbability: prediction.winProbability,
    expectedRevenue: prediction.expectedRevenue,
    reasoning: prediction.reasoning,
  };
}

async function suggestActions(state: typeof ConversionPredictionState.State) {
  const llm = createLLM({ temperature: 0.4 });

  const prompt = `Based on the prediction below, suggest specific actions to improve conversion chances.

Win Probability: ${state.winProbability}
Expected Revenue: ${JSON.stringify(state.expectedRevenue)}
Reasoning: ${state.reasoning}
Lead: ${JSON.stringify(state.leadProfile)}
Industry: ${state.industry}

Provide as JSON: { "suggestedActions": [{ "action": string, "priority": "high" | "medium" | "low", "reason": string }] }

Suggest 2-4 actionable steps in priority order.`;

  const response = await llm.invoke(prompt);
  const result = JSON.parse(response.content as string);

  return { suggestedActions: result.suggestedActions };
}

async function formatPrediction(state: typeof ConversionPredictionState.State) {
  return {
    winProbability: state.winProbability,
    expectedRevenue: state.expectedRevenue,
    suggestedActions: state.suggestedActions,
    reasoning: state.reasoning,
  };
}

const workflow = new StateGraph(ConversionPredictionState)
  .addNode("analyzeDealHistory", analyzeDealHistory)
  .addNode("evaluateFactors", evaluateFactors)
  .addNode("predictOutcome", predictOutcome)
  .addNode("suggestActions", suggestActions)
  .addNode("formatPrediction", formatPrediction)
  .addEdge("__start__", "analyzeDealHistory")
  .addEdge("analyzeDealHistory", "evaluateFactors")
  .addEdge("evaluateFactors", "predictOutcome")
  .addEdge("predictOutcome", "suggestActions")
  .addEdge("suggestActions", "formatPrediction")
  .addEdge("formatPrediction", "__end__");

export const conversionPredictionAgent = workflow.compile();

export async function predictConversion(params: {
  dealHistory: any[];
  leadProfile: any;
  industry: string;
  dealSize: number;
  stageDuration: number;
  engagementScore: number;
}): Promise<PredictionResult> {
  try {
    const result = await conversionPredictionAgent.invoke(params);
    return {
      winProbability: result.winProbability,
      expectedRevenue: result.expectedRevenue,
      suggestedActions: result.suggestedActions,
      reasoning: result.reasoning,
    };
  } catch (error) {
    console.error("Conversion prediction agent error:", error);
    throw new Error(
      `Failed to predict conversion: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
