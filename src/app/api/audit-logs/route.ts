import { NextRequest } from "next/server";
import {
  getAuthenticatedUser,
  getOrganizationId,
  serverError,
  paginatedResponse,
  badRequest,
} from "@/lib/api/utils";
import { Role } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser();
    if (!user) return unauthorized();

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role as string | undefined;

    if (!role || role === Role.VIEWER) {
      return unauthorized();
    }

    const orgId = await getOrganizationId(supabase, user.id);
    if (!orgId) return badRequest("No organization found");

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") ?? "20", 10) || 20));
    const action = searchParams.get("action");
    const entityType = searchParams.get("entity_type");
    const userId = searchParams.get("user_id");
    const dateFrom = searchParams.get("date_from");
    const dateTo = searchParams.get("date_to");

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: orgUserIds } = await supabase
      .from("profiles")
      .select("id")
      .eq("organization_id", orgId);

    const userIds = orgUserIds?.map((p) => p.id) ?? [];

    if (userIds.length === 0) {
      return paginatedResponse([], 0, page, limit);
    }

    let query = supabase
      .from("audit_logs")
      .select("*, profiles!left(email, full_name)", { count: "exact" })
      .in("user_id", userIds);

    if (action) {
      query = query.eq("action", action);
    }

    if (entityType) {
      query = query.eq("entity_type", entityType);
    }

    if (userId) {
      query = query.eq("user_id", userId);
    }

    if (dateFrom) {
      query = query.gte("created_at", dateFrom);
    }

    if (dateTo) {
      query = query.lte("created_at", dateTo);
    }

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) return serverError(error);

    return paginatedResponse(data ?? [], count ?? 0, page, limit);
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
