/* eslint-disable @typescript-eslint/no-explicit-any */
import { Annotation, StateGraph } from "@langchain/langgraph";
import { createLLM } from "@/lib/ai/llm";

interface ForecastPoint {
  month: string;
  predictedRevenue: number;
  lowerBound: number;
  upperBound: number;
}

interface SalesForecastResult {
  forecast: ForecastPoint[];
  confidence: number;
  keyDrivers: string[];
  risks: string[];
}

const SalesForecastState = Annotation.Root({
  historicalData: Annotation<any[]>,
  pipelineDeals: Annotation<any[]>,
  seasonalityFactors: Annotation<any[]>,
  marketTrends: Annotation<string>,
  forecast: Annotation<ForecastPoint[]>,
  confidence: Annotation<number>,
  keyDrivers: Annotation<string[]>,
  risks: Annotation<string[]>,
});

async function analyzeHistory(state: typeof SalesForecastState.State) {
  const llm = createLLM({ temperature: 0.2 });

  const prompt = `You are a sales data analyst. Analyze historical sales data and identify trends and patterns.

Historical Data: ${JSON.stringify(state.historicalData)}
Pipeline Deals: ${JSON.stringify(state.pipelineDeals)}
Seasonality Factors: ${JSON.stringify(state.seasonalityFactors)}
Market Trends: ${state.marketTrends}

Provide analysis as JSON: {
  "trend_analysis": { "direction": string ("up" | "down" | "stable"), "growth_rate": string, "seasonal_pattern": string },
  "keyDrivers": string[] (factors that historically drive revenue),
  "confidence_factors": string[] (reasons to be confident or cautious)
}

Consider:
- Month-over-month and year-over-year trends
- Seasonal patterns and cycles
- Pipeline health and deal stages
- Market conditions`;

  const response = await llm.invoke(prompt);
  const analysis = JSON.parse(response.content as string);

  return { keyDrivers: analysis.keyDrivers };
}

async function predictForecast(state: typeof SalesForecastState.State) {
  const llm = createLLM({ temperature: 0.2 });

  const prompt = `You are a sales forecasting expert. Generate a 6-month revenue forecast based on historical data and pipeline.

Historical Data: ${JSON.stringify(state.historicalData)}
Pipeline Deals: ${JSON.stringify(state.pipelineDeals)}
Seasonality Factors: ${JSON.stringify(state.seasonalityFactors)}
Market Trends: ${state.marketTrends}
Key Drivers: ${JSON.stringify(state.keyDrivers)}

Provide forecast as JSON: {
  "forecast": [{ "month": string (YYYY-MM), "predictedRevenue": number, "lowerBound": number (80% confidence low), "upperBound": number (80% confidence high) }],
  "confidence": number (0-1, overall confidence in the forecast)
}

Generate exactly 6 monthly forecasts starting from next month.
Consider:
- Historical run rate and growth trajectory
- Pipeline coverage ratio
- Seasonal adjustments
- Win rate assumptions
- Market trend impacts`;

  const response = await llm.invoke(prompt);
  const result = JSON.parse(response.content as string);

  return {
    forecast: result.forecast,
    confidence: result.confidence,
  };
}

async function identifyRisks(state: typeof SalesForecastState.State) {
  const llm = createLLM({ temperature: 0.2 });

  const prompt = `You are a risk assessment specialist. Identify potential risks and downside factors for this sales forecast.

Historical Data: ${JSON.stringify(state.historicalData)}
Pipeline Deals: ${JSON.stringify(state.pipelineDeals)}
Seasonality Factors: ${JSON.stringify(state.seasonalityFactors)}
Market Trends: ${state.marketTrends}
Forecast: ${JSON.stringify(state.forecast)}
Confidence: ${state.confidence}

Provide as JSON: {
  "risks": string[] (3-5 specific risks that could impact the forecast)
}

Risks should be:
- Specific and actionable
- Include both internal (team, pipeline) and external (market, competitive) factors
- Ranked by likelihood and impact`;

  const response = await llm.invoke(prompt);
  const result = JSON.parse(response.content as string);

  return { risks: result.risks };
}

const workflow = new StateGraph(SalesForecastState)
  .addNode("analyzeHistory", analyzeHistory)
  .addNode("predictForecast", predictForecast)
  .addNode("identifyRisks", identifyRisks)
  .addEdge("__start__", "analyzeHistory")
  .addEdge("analyzeHistory", "predictForecast")
  .addEdge("predictForecast", "identifyRisks")
  .addEdge("identifyRisks", "__end__");

export const salesForecastAgent = workflow.compile();

export async function forecastSales(params: {
  historicalData: { month: string; revenue: number; leads: number; conversions: number }[];
  pipelineDeals: any[];
  seasonalityFactors: any[];
  marketTrends: string;
}): Promise<SalesForecastResult> {
  try {
    const result = await salesForecastAgent.invoke(params);
    return {
      forecast: result.forecast,
      confidence: result.confidence,
      keyDrivers: result.keyDrivers,
      risks: result.risks,
    };
  } catch (error) {
    console.error("Sales forecast agent error:", error);
    throw new Error(
      `Failed to forecast sales: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
