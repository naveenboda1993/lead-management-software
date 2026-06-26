/* eslint-disable @typescript-eslint/no-explicit-any */
import { Annotation, StateGraph } from "@langchain/langgraph";
import { createLLM } from "@/lib/ai/llm";

interface AdsOptimizationResult {
  performance: any;
  recommendations: { action: string; reason: string; expectedImpact: string }[];
  budgetAllocation: any;
  keywordSuggestions: string[];
}

const AdsOptimizationState = Annotation.Root({
  campaignData: Annotation<any>,
  adGroups: Annotation<any[]>,
  keywords: Annotation<string[]>,
  performance: Annotation<any>,
  recommendations: Annotation<any[]>,
  budgetAllocation: Annotation<any>,
  keywordSuggestions: Annotation<string[]>,
});

async function analyzePerformance(state: typeof AdsOptimizationState.State) {
  const llm = createLLM({ temperature: 0.2 });

  const prompt = `You are an ads performance analyst. Analyze this campaign's performance data and identify key insights.

Campaign Data: ${JSON.stringify(state.campaignData)}
Ad Groups: ${JSON.stringify(state.adGroups)}
Keywords: ${JSON.stringify(state.keywords)}

Provide analysis as JSON: {
  "performance": {
    "overall_rating": string ("excellent" | "good" | "average" | "poor"),
    "ctr_assessment": string,
    "cpc_assessment": string,
    "conversion_assessment": string,
    "roi_assessment": string,
    "bottlenecks": string[]
  }
}

Consider:
- CTR benchmarks (industry average ~2-3%)
- CPC efficiency relative to budget
- Conversion rate and cost per conversion
- Overall ROAS/ROI`;

  const response = await llm.invoke(prompt);
  const analysis = JSON.parse(response.content as string);

  return { performance: analysis.performance };
}

async function optimizeBidding(state: typeof AdsOptimizationState.State) {
  const llm = createLLM({ temperature: 0.2 });

  const prompt = `You are an ads bidding strategist. Recommend bid optimizations and budget allocation changes.

Campaign Data: ${JSON.stringify(state.campaignData)}
Ad Groups: ${JSON.stringify(state.adGroups)}
Performance: ${JSON.stringify(state.performance)}

Provide recommendations as JSON: {
  "recommendations": [{ "action": string, "reason": string, "expectedImpact": string }],
  "budgetAllocation": { "strategy": string, "suggested_changes": string[] }
}

Focus on:
- Increasing budget for high-performing ad groups
- Reducing spend on underperformers
- Bid adjustments by device/location/time
- Target CPA/ROAS optimization`;

  const response = await llm.invoke(prompt);
  const result = JSON.parse(response.content as string);

  return {
    recommendations: result.recommendations,
    budgetAllocation: result.budgetAllocation,
  };
}

async function suggestKeywords(state: typeof AdsOptimizationState.State) {
  const llm = createLLM({ temperature: 0.2 });

  const prompt = `You are an SEO and PPC keyword specialist. Suggest keyword optimizations based on campaign performance.

Current Keywords: ${JSON.stringify(state.keywords)}
Campaign Data: ${JSON.stringify(state.campaignData)}
Performance: ${JSON.stringify(state.performance)}

Provide as JSON: {
  "keywordSuggestions": string[] (10-15 recommended new keywords or negative keywords prefixed with "-")
}

Include:
- High-intent keywords to add
- Low-performers to pause (prefixed with "-")
- Long-tail variations
- Competitor keywords`;

  const response = await llm.invoke(prompt);
  const result = JSON.parse(response.content as string);

  return { keywordSuggestions: result.keywordSuggestions };
}

const workflow = new StateGraph(AdsOptimizationState)
  .addNode("analyzePerformance", analyzePerformance)
  .addNode("optimizeBidding", optimizeBidding)
  .addNode("suggestKeywords", suggestKeywords)
  .addEdge("__start__", "analyzePerformance")
  .addEdge("analyzePerformance", "optimizeBidding")
  .addEdge("optimizeBidding", "suggestKeywords")
  .addEdge("suggestKeywords", "__end__");

export const adsOptimizationAgent = workflow.compile();

export async function optimizeAds(params: {
  campaignData: any;
  adGroups: any[];
  keywords: string[];
}): Promise<AdsOptimizationResult> {
  try {
    const result = await adsOptimizationAgent.invoke(params);
    return {
      performance: result.performance,
      recommendations: result.recommendations,
      budgetAllocation: result.budgetAllocation,
      keywordSuggestions: result.keywordSuggestions,
    };
  } catch (error) {
    console.error("Ads optimization agent error:", error);
    throw new Error(
      `Failed to optimize ads: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
