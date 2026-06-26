import { NextRequest } from "next/server";
import {
  getAuthenticatedUser,
  getOrganizationId,
  successResponse,
  badRequest,
  notFound,
  serverError,
} from "@/lib/api/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, supabase } = await getAuthenticatedUser();
    if (!user) return unauthorized();

    const orgId = await getOrganizationId(supabase, user.id);
    if (!orgId) return badRequest("No organization found");

    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .eq("id", id)
      .eq("organization_id", orgId)
      .single();

    if (error || !data) return notFound("Ticket");

    return successResponse(data);
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, supabase } = await getAuthenticatedUser();
    if (!user) return unauthorized();

    const orgId = await getOrganizationId(supabase, user.id);
    if (!orgId) return badRequest("No organization found");

    const { data: existing } = await supabase
      .from("tickets")
      .select("id")
      .eq("id", id)
      .eq("organization_id", orgId)
      .single();

    if (!existing) return notFound("Ticket");

    const body = await request.json();
    const { data, error } = await supabase
      .from("tickets")
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, supabase } = await getAuthenticatedUser();
    if (!user) return unauthorized();

    const orgId = await getOrganizationId(supabase, user.id);
    if (!orgId) return badRequest("No organization found");

    const { data: existing } = await supabase
      .from("tickets")
      .select("id")
      .eq("id", id)
      .eq("organization_id", orgId)
      .single();

    if (!existing) return notFound("Ticket");

    const { error } = await supabase
      .from("tickets")
      .delete()
      .eq("id", id)
      .eq("organization_id", orgId);

    if (error) return serverError(error);

    return successResponse({ message: "Ticket deleted successfully" });
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
