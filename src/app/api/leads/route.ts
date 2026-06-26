import { NextRequest } from "next/server";
import { createLeadSchema } from "@/lib/validations/lead";
import {
  getAuthenticatedUser,
  getOrganizationId,
  logActivity,
  logAuditEvent,
  generateLeadNumber,
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
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const source = searchParams.get("source");
    const priority = searchParams.get("priority");
    const assignedTo = searchParams.get("assigned_to");
    const dateFrom = searchParams.get("date_from");
    const dateTo = searchParams.get("date_to");
    const sortBy = searchParams.get("sort_by") || "created_at";
    const sortOrder = searchParams.get("sort_order") || "desc";

    const allowedSortColumns = ["created_at", "updated_at", "first_name", "last_name", "email", "status", "priority", "estimated_deal_value"];
    const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : "created_at";
    const safeSortOrder = sortOrder === "asc" ? "asc" : "desc";

    let query = supabase
      .from("leads")
      .select("*", { count: "exact" })
      .eq("organization_id", orgId);

    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%,lead_number.ilike.%${search}%`
      );
    }

    if (status) {
      const statuses = status.split(",");
      query = query.in("status", statuses);
    }

    if (source) {
      const sources = source.split(",");
      query = query.in("lead_source", sources);
    }

    if (priority) {
      const priorities = priority.split(",");
      query = query.in("priority", priorities);
    }

    if (assignedTo) {
      query = query.eq("assigned_to", assignedTo);
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
      .order(safeSortBy, { ascending: safeSortOrder === "asc" })
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
    const parsed = createLeadSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((e: { message: string }) => e.message).join(", "));
    }

    const { data: existingDuplicate } = await supabase
      .from("leads")
      .select("id")
      .eq("organization_id", orgId)
      .or(`email.eq.${parsed.data.email},mobile.eq.${parsed.data.mobile}`)
      .maybeSingle();

    if (existingDuplicate) {
      return badRequest("A lead with this email or mobile already exists in your organization");
    }

    const leadNumber = generateLeadNumber();

    const { data: lead, error } = await supabase
      .from("leads")
      .insert({
        ...parsed.data,
        lead_number: leadNumber,
        organization_id: orgId,
        owner_id: user.id,
        assigned_to: parsed.data.assigned_to ?? user.id,
      })
      .select()
      .single();

    if (error) return serverError(error);

    await logActivity(supabase, {
      lead_id: lead.id,
      type: "LEAD_CREATED",
      description: `Lead ${lead.first_name} ${lead.last_name} was created`,
      created_by: user.id,
      metadata: { lead_number: leadNumber },
    });

    await logAuditEvent(supabase, {
      action: "CREATE",
      entity_type: "lead",
      entity_id: lead.id,
      user_id: user.id,
      changes: parsed.data as unknown as Record<string, unknown>,
    });

    return successResponse(lead, 201);
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
