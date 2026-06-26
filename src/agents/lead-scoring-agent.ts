/* eslint-disable @typescript-eslint/no-explicit-any */
import { Annotation, StateGraph } from "@langchain/langgraph";
import { createLLM } from "@/lib/ai/llm";

const LeadScoringState = Annotation.Root({
  leadProfile: Annotation<any>,
  source: Annotation<string>,
  industry: Annotation<string>,
  companySize: Annotation<string>,
  interactionHistory: Annotation<any[]>,
  score: Annotation<number>,
  conversionProbability: Annotation<number>,
  recommendation: Annotation<string>,
  reasoning: Annotation<string>,
});

async function analyzeLead(state: typeof LeadScoringState.State) {
  const llm = createLLM({ temperature: 0.3 });

  const prompt = `You are a lead scoring expert. Analyze this lead and provide a score from 1-100.

Lead Profile: ${JSON.stringify(state.leadProfile)}
Source: ${state.source}
Industry: ${state.industry}
Company Size: ${state.companySize}
Interaction History: ${JSON.stringify(state.interactionHistory)}

Provide analysis as JSON: { "score": number, "conversion_probability": number (0-1), "recommendation": string, "reasoning": string }

Score criteria:
- 80-100: Hot lead, ready to close
- 60-79: Warm lead, needs nurturing
- 40-59: Cold lead, requires engagement
- Below 40: Low priority`;

  const response = await llm.invoke(prompt);
  const analysis = JSON.parse(response.content as string);

  return {
    score: analysis.score,
    conversionProbability: analysis.conversion_probability,
    recommendation: analysis.recommendation,
    reasoning: analysis.reasoning,
  };
}

const workflow = new StateGraph(LeadScoringState)
  .addNode("analyze", analyzeLead)
  .addEdge("__start__", "analyze")
  .addEdge("analyze", "__end__");

export const leadScoringAgent = workflow.compile();

export async function scoreLead(params: {
  leadProfile: any;
  source: string;
  industry: string;
  companySize: string;
  interactionHistory: any[];
}) {
  try {
    const result = await leadScoringAgent.invoke(params);
    return result;
  } catch (error) {
    console.error("Lead scoring agent error:", error);
    throw new Error(
      `Failed to score lead: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
