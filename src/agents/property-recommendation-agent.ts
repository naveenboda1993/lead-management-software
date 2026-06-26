/* eslint-disable @typescript-eslint/no-explicit-any */
import { Annotation, StateGraph } from "@langchain/langgraph";
import { createLLM } from "@/lib/ai/llm";

interface PropertyRecommendationResult {
  recommendations: { property_id: string; score: number; match_reasons: string[] }[];
  top_match: { property_id: string; score: number; match_reasons: string[] } | null;
}

const PropertyRecommendationState = Annotation.Root({
  buyerPreferences: Annotation<any>,
  propertyListings: Annotation<any[]>,
  recommendations: Annotation<any[]>,
  topMatch: Annotation<any>,
});

async function analyzePreferences(state: typeof PropertyRecommendationState.State) {
  const llm = createLLM({ temperature: 0.3 });

  const prompt = `You are a property recommendation expert. Analyze these buyer preferences and identify key criteria for matching.

Buyer Preferences: ${JSON.stringify(state.buyerPreferences)}

Provide analysis as JSON: {
  "criteria": { "budget_range": string, "preferred_locations": string[], "property_type_focus": string, "min_bedrooms": number, "required_amenities": string[] },
  "weighting": { "location_weight": number (0-1), "price_weight": number (0-1), "type_weight": number (0-1), "bedrooms_weight": number (0-1), "amenities_weight": number (0-1) }
}

Consider:
- Budget determines price range filtering
- Location preferences and proximity
- Property type compatibility
- Bedroom requirements
- Amenity matching`;

  const response = await llm.invoke(prompt);
  const _analysis = JSON.parse(response.content as string);
  return {};
}

async function matchProperties(state: typeof PropertyRecommendationState.State) {
  const llm = createLLM({ temperature: 0.3 });

  const prompt = `You are a property matching specialist. Match these buyer preferences against available property listings and score each.

Buyer Preferences: ${JSON.stringify(state.buyerPreferences)}
Property Listings: ${JSON.stringify(state.propertyListings)}

Provide results as JSON: {
  "recommendations": [{ "property_id": string, "score": number (0-100), "match_reasons": string[] }],
  "top_match": { "property_id": string, "score": number, "match_reasons": string[] }
}

Scoring criteria:
- Budget fit (30 points): within budget = full points, slightly over = partial
- Location match (25 points): preferred area or nearby
- Property type (15 points): exact match preferred
- Bedrooms (15 points): exact or more
- Amenities (15 points): coverage of desired amenities
- Return empty recommendations array and null top_match if no listings provided`;

  const response = await llm.invoke(prompt);
  const match = JSON.parse(response.content as string);

  return {
    recommendations: match.recommendations,
    topMatch: match.top_match,
  };
}

const workflow = new StateGraph(PropertyRecommendationState)
  .addNode("analyzePreferences", analyzePreferences)
  .addNode("matchProperties", matchProperties)
  .addEdge("__start__", "analyzePreferences")
  .addEdge("analyzePreferences", "matchProperties")
  .addEdge("matchProperties", "__end__");

export const propertyRecommendationAgent = workflow.compile();

export async function recommendProperties(params: {
  buyerPreferences: any;
  propertyListings: any[];
}): Promise<PropertyRecommendationResult> {
  try {
    const result = await propertyRecommendationAgent.invoke(params);
    return {
      recommendations: result.recommendations ?? [],
      top_match: result.topMatch ?? null,
    };
  } catch (error) {
    console.error("Property recommendation agent error:", error);
    throw new Error(
      `Failed to recommend properties: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
