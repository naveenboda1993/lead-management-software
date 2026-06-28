import { NextRequest } from "next/server";
import {
  getAuthenticatedUser,
  getOrganizationId,
  successResponse,
  badRequest,
  forbidden,
  serverError,
} from "@/lib/api/utils";
import { z } from "zod";

const bulkActionSchema = z.object({
  lead_ids: z.array(z.string().uuid()).min(1, "At least one lead ID is required"),
  action: z.enum(["assign", "delete", "export"]),
  assignee_id: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser();
    if (!user) return unauthorized();

    const orgId = await getOrganizationId(supabase, user.id);
    if (!orgId) return badRequest("No organization found");

    const body = await request.json();
    const parsed = bulkActionSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((e: { message: string }) => e.message).join(", "));
    }

    const { lead_ids, action, assignee_id } = parsed.data;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role as string | undefined;

    const { data: leads } = await supabase
      .from("leads")
      .select("id")
      .eq("organization_id", orgId)
      .in("id", lead_ids);

    const validIds = leads?.map((l) => l.id) ?? [];
    if (validIds.length === 0) return badRequest("No valid leads found");

    switch (action) {
      case "assign": {
        if (!assignee_id) return badRequest("assignee_id is required for assign action");

        const { data: assignee } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", assignee_id)
          .eq("organization_id", orgId)
          .single();

        if (!assignee) return badRequest("Assignee not found in your organization");

        const { error: assignError } = await supabase
          .from("leads")
          .update({ assigned_to: assignee_id })
          .in("id", validIds)
          .eq("organization_id", orgId);

        if (assignError) return serverError(assignError);

        return successResponse({
          message: `Assigned ${validIds.length} lead(s) successfully`,
          count: validIds.length,
        });
      }

      case "delete": {
        if (!role || !["SUPER_ADMIN", "ADMIN", "SALES_MANAGER"].includes(role)) {
          return forbidden("Only super admins, admins, and sales managers can delete leads");
        }

        const { error: deleteError } = await supabase
          .from("leads")
          .delete()
          .in("id", validIds)
          .eq("organization_id", orgId);

        if (deleteError) return serverError(deleteError);

        return successResponse({
          message: `Deleted ${validIds.length} lead(s) successfully`,
          count: validIds.length,
        });
      }

      case "export": {
        const { data: exportData } = await supabase
          .from("leads")
          .select("*")
          .in("id", validIds)
          .eq("organization_id", orgId);

        return successResponse({
          leads: exportData ?? [],
          count: validIds.length,
        });
      }

      default:
        return badRequest("Invalid action");
    }
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
