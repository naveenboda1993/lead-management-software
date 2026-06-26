/* eslint-disable @typescript-eslint/no-explicit-any */
import { Annotation, StateGraph } from "@langchain/langgraph";
import { createLLM } from "@/lib/ai/llm";

interface MarketingCampaignResult {
  campaignName: string;
  targetAudience: string;
  channels: string[];
  budget: number;
  content: { subject?: string; body: string; ctas: string[] };
  schedule: string;
  kpis: string[];
}

const MarketingCampaignState = Annotation.Root({
  campaignGoal: Annotation<string>,
  targetAudience: Annotation<string>,
  budget: Annotation<number>,
  channel: Annotation<string>,
  industry: Annotation<string>,
  campaignName: Annotation<string>,
  channels: Annotation<string[]>,
  content: Annotation<any>,
  schedule: Annotation<string>,
  kpis: Annotation<string[]>,
});

async function analyzeGoal(state: typeof MarketingCampaignState.State) {
  const llm = createLLM({ temperature: 0.3 });

  const prompt = `You are a marketing strategist. Analyze this campaign goal and audience to determine the optimal approach.

Campaign Goal: ${state.campaignGoal}
Target Audience: ${state.targetAudience}
Budget: $${state.budget}
Primary Channel: ${state.channel}
Industry: ${state.industry}

Provide analysis as JSON: {
  "campaignName": string (catchy campaign name),
  "targetAudience": string (refined audience description),
  "channels": string[] (1-3 recommended channels including the primary),
  "analysis_insights": string (key strategic observations)
}

Consider:
- Goal type (awareness, consideration, conversion, retention)
- Audience demographics and behavior
- Budget allocation across channels
- Industry best practices`;

  const response = await llm.invoke(prompt);
  const analysis = JSON.parse(response.content as string);

  return {
    campaignName: analysis.campaignName,
    targetAudience: analysis.targetAudience,
    channels: analysis.channels,
  };
}

async function createStrategy(state: typeof MarketingCampaignState.State) {
  const llm = createLLM({ temperature: 0.3 });

  const prompt = `You are a campaign strategist. Create a detailed strategy for this marketing campaign.

Campaign Name: ${state.campaignName}
Goal: ${state.campaignGoal}
Target Audience: ${state.targetAudience}
Channels: ${JSON.stringify(state.channels)}
Budget: $${state.budget}
Industry: ${state.industry}

Provide as JSON: {
  "schedule": string (recommended timeline with phases),
  "kpis": string[] (3-5 measurable KPIs),
  "budget_split": { "channel": string, "amount": number }[]
}

KPIs should be specific to the goal (CTR for awareness, conversions for performance, etc.).`;

  const response = await llm.invoke(prompt);
  const strategy = JSON.parse(response.content as string);

  return {
    schedule: strategy.schedule,
    kpis: strategy.kpis,
  };
}

async function generateContent(state: typeof MarketingCampaignState.State) {
  const llm = createLLM({ temperature: 0.7 });

  const prompt = `You are a creative marketing copywriter. Generate compelling campaign content.

Campaign Name: ${state.campaignName}
Goal: ${state.campaignGoal}
Target Audience: ${state.targetAudience}
Channels: ${JSON.stringify(state.channels)}
Industry: ${state.industry}

Provide content as JSON: {
  "content": {
    "subject": string (email subject line, omit if not email-focused),
    "body": string (main campaign message/body copy),
    "ctas": string[] (2-3 call-to-action options)
  }
}

Rules:
- Tone should match the target audience and industry
- Body should be compelling and action-oriented
- CTAs should be clear and urgent
- Reference specific channels where content will appear`;

  const response = await llm.invoke(prompt);
  const result = JSON.parse(response.content as string);

  return { content: result.content };
}

const workflow = new StateGraph(MarketingCampaignState)
  .addNode("analyzeGoal", analyzeGoal)
  .addNode("createStrategy", createStrategy)
  .addNode("generateContent", generateContent)
  .addEdge("__start__", "analyzeGoal")
  .addEdge("analyzeGoal", "createStrategy")
  .addEdge("createStrategy", "generateContent")
  .addEdge("generateContent", "__end__");

export const marketingCampaignAgent = workflow.compile();

export async function generateCampaign(params: {
  campaignGoal: string;
  targetAudience: string;
  budget: number;
  channel: string;
  industry: string;
}): Promise<MarketingCampaignResult> {
  try {
    const result = await marketingCampaignAgent.invoke(params);
    return {
      campaignName: result.campaignName,
      targetAudience: result.targetAudience,
      channels: result.channels,
      budget: params.budget,
      content: result.content,
      schedule: result.schedule,
      kpis: result.kpis,
    };
  } catch (error) {
    console.error("Marketing campaign agent error:", error);
    throw new Error(
      `Failed to generate campaign: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
