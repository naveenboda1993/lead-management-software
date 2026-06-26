import { NextRequest } from "next/server";
import {
  getAuthenticatedUser,
  getOrganizationId,
  successResponse,
  badRequest,
  serverError,
} from "@/lib/api/utils";

export async function GET(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser();
    if (!user) return unauthorized();

    const orgId = await getOrganizationId(supabase, user.id);
    if (!orgId) return badRequest("No organization found");

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employee_id");
    const status = searchParams.get("status");

    let query = supabase
      .from("leaves")
      .select("*")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false });

    if (employeeId) {
      query = query.eq("employee_id", employeeId);
    }
    if (status) {
      const statuses = status.split(",");
      query = query.in("status", statuses);
    }

    const { data, error } = await query;
    if (error) return serverError(error);

    return successResponse(data ?? []);
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
      .from("leaves")
      .insert({ ...body, organization_id: orgId })
      .select()
      .single();

    if (error) return serverError(error);

    return successResponse(data, 201);
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser();
    if (!user) return unauthorized();

    const orgId = await getOrganizationId(supabase, user.id);
    if (!orgId) return badRequest("No organization found");

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return badRequest("Leave ID is required");

    const body = await request.json();
    const { data, error } = await supabase
      .from("leaves")
      .update(body)
      .eq("id", id)
      .eq("organization_id", orgId)
      .select()
      .single();

    if (error || !data) return serverError(error ?? "Update failed");

    return successResponse(data);
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
