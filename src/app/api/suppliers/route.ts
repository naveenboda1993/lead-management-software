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
    const search = searchParams.get("search");

    let query = supabase
      .from("suppliers")
      .select("*", { count: "exact" })
      .eq("organization_id", orgId);

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`
      );
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count, error } = await query
      .order("name", { ascending: true })
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
      .from("suppliers")
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
