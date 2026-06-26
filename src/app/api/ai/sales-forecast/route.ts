/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import {
  getAuthenticatedUser,
  getOrganizationId,
  logActivity,
  successResponse,
  badRequest,
  serverError,
} from "@/lib/api/utils";
import { forecastSales } from "@/agents/sales-forecast-agent";

export async function POST(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser();
    if (!user) {
      return Response.json(
        { data: null, error: "Unauthorized", success: false },
        { status: 401 }
      );
    }

    const orgId = await getOrganizationId(supabase, user.id);
    if (!orgId) {
      return badRequest("No organization found");
    }

    const body = await request.json();
    const { historical_data, pipeline_deals, seasonality_factors, market_trends } = body;

    if (!historical_data || !Array.isArray(historical_data)) {
      return badRequest("historical_data array is required");
    }

    const { data: deals } = await supabase
      .from("leads")
      .select("id, first_name, last_name, company, estimated_deal_value, status, stage, created_at")
      .eq("organization_id", orgId)
      .in("status", ["QUALIFIED", "PROPOSAL_SENT", "NEGOTIATION"])
      .order("created_at", { ascending: false });

    const pipelineDeals = (deals ?? []).map((d: any) => ({
      id: d.id,
      name: `${d.first_name} ${d.last_name}`,
      company: d.company,
      value: d.estimated_deal_value,
      status: d.status,
      stage: d.stage,
    }));

    const result = await forecastSales({
      historicalData: historical_data,
      pipelineDeals: pipeline_deals || pipelineDeals,
      seasonalityFactors: seasonality_factors || [],
      marketTrends: market_trends || "Stable market conditions",
    });

    await logActivity(supabase, {
      type: "AI_FORECAST_GENERATED",
      description: `AI generated sales forecast with ${Math.round(result.confidence * 100)}% confidence`,
      created_by: user.id,
      metadata: {
        confidence: result.confidence,
        forecast_months: result.forecast.length,
        key_drivers: result.keyDrivers,
      },
    });

    return successResponse({
      forecast: result.forecast,
      confidence: result.confidence,
      key_drivers: result.keyDrivers,
      risks: result.risks,
    });
  } catch (error) {
    return serverError(error);
  }
}
