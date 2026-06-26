import { NextRequest } from "next/server";
import {
  getAuthenticatedUser,
  getOrganizationId,
  successResponse,
  badRequest,
  serverError,
  paginatedResponse,
  parseNumericParam,
} from "@/lib/api/utils";

export async function GET(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser();
    if (!user) return unauthorized();

    const orgId = await getOrganizationId(supabase, user.id);
    if (!orgId) return badRequest("No organization found");

    const { searchParams } = new URL(request.url);
    const page = parseNumericParam(searchParams.get("page"), 1);
    const limit = parseNumericParam(searchParams.get("limit"), 20);
    const direction = searchParams.get("direction");
    const status = searchParams.get("status");
    const agentId = searchParams.get("agent_id");
    const leadId = searchParams.get("lead_id");
    const dateFrom = searchParams.get("date_from");
    const dateTo = searchParams.get("date_to");

    let query = supabase
      .from("call_logs")
      .select("*", { count: "exact" })
      .eq("organization_id", orgId);

    if (direction) {
      const directions = direction.split(",");
      query = query.in("direction", directions);
    }
    if (status) {
      const statuses = status.split(",");
      query = query.in("status", statuses);
    }
    if (agentId) {
      query = query.eq("agent_id", agentId);
    }
    if (leadId) {
      query = query.eq("lead_id", leadId);
    }
    if (dateFrom) {
      query = query.gte("created_at", dateFrom);
    }
    if (dateTo) {
      query = query.lte("created_at", dateTo);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) return serverError(error);

    return paginatedResponse(data ?? [], count ?? 0, page, limit);
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser();
    if (!user) return unauthorized();

    const orgId = await getOrganizationId(supabase, user.id);
    if (!orgId) return badRequest("No organization found");

    const body = await request.json();

    const { data, error } = await supabase
      .from("call_logs")
      .insert({ ...body, organization_id: orgId })
      .select()
      .single();

    if (error) return serverError(error);

    return successResponse(data, 201);
  } catch (error) {
    return serverError(error);
  }
}

function unauthorized() {
  return Response.json(
    { data: null, error: "Unauthorized", success: false },
    { status: 401 }
  );
}
