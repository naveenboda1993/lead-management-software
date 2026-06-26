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
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const city = searchParams.get("city");
    const minPrice = searchParams.get("min_price");
    const maxPrice = searchParams.get("max_price");
    const bedrooms = searchParams.get("bedrooms");

    let query = supabase
      .from("properties")
      .select("*", { count: "exact" })
      .eq("organization_id", orgId);

    if (search) {
      query = query.or(
        `property_name.ilike.%${search}%,location.ilike.%${search}%,city.ilike.%${search}%`
      );
    }
    if (type) {
      const types = type.split(",");
      query = query.in("property_type", types);
    }
    if (status) {
      const statuses = status.split(",");
      query = query.in("status", statuses);
    }
    if (city) {
      query = query.eq("city", city);
    }
    if (minPrice) {
      query = query.gte("price", parseFloat(minPrice));
    }
    if (maxPrice) {
      query = query.lte("price", parseFloat(maxPrice));
    }
    if (bedrooms) {
      query = query.eq("bedrooms", parseInt(bedrooms));
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
      .from("properties")
      .insert({ ...body, organization_id: orgId, owner_id: user.id })
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
