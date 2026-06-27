import { NextRequest } from "next/server";
import { documentUploadSchema } from "@/lib/validations/document";
import {
  getAuthenticatedUser,
  getOrganizationId,
  logActivity,
  successResponse,
  badRequest,
  serverError,
} from "@/lib/api/utils";

export async function POST(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser();
    if (!user) return unauthorized();

    const orgId = await getOrganizationId(supabase, user.id);
    if (!orgId) return badRequest("No organization found");

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const name = formData.get("name") as string | null;
    const leadId = formData.get("lead_id") as string | null;

    if (!file) return badRequest("File is required");
    if (!name) return badRequest("Document name is required");

    if (leadId) {
      const { data: lead } = await supabase
        .from("leads")
        .select("id")
        .eq("id", leadId)
        .eq("organization_id", orgId)
        .single();

      if (!lead) return badRequest("Lead not found in your organization");
    }

    const fileExt = file.name.split(".").pop() || "unknown";
    const filePath = `${leadId ?? "general"}/${Date.now()}_${file.name}`;
    const fileSize = file.size;
    const fileType = file.type || fileExt;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, file);

    if (uploadError) return badRequest("Upload failed: " + uploadError.message);

    const parsed = documentUploadSchema.safeParse({
      name,
      file_path: filePath,
      file_size: fileSize,
      file_type: fileType,
      lead_id: leadId || null,
    });

    if (!parsed.success) {
      await supabase.storage.from("documents").remove([filePath]);
      return badRequest(parsed.error.issues.map((e: { message: string }) => e.message).join(", "));
    }

    const { data: doc, error: dbError } = await supabase
      .from("documents")
      .insert({
        name: parsed.data.name,
        file_path: parsed.data.file_path,
        file_size: parsed.data.file_size,
        file_type: parsed.data.file_type,
        lead_id: parsed.data.lead_id ?? null,
        organization_id: orgId,
        uploaded_by: user.id,
      })
      .select()
      .single();

    if (dbError) {
      await supabase.storage.from("documents").remove([filePath]);
      return serverError(dbError);
    }

    if (leadId) {
      await logActivity(supabase, {
        lead_id: leadId,
        type: "DOCUMENT_UPLOADED",
        description: `Document "${name}" was uploaded`,
        created_by: user.id,
        metadata: { document_id: doc.id, file_type: fileType, file_size: fileSize },
      });
    }

    return successResponse(doc, 201);
  } catch (error) {
    return serverError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser();
    if (!user) return unauthorized();

    const orgId = await getOrganizationId(supabase, user.id);
    if (!orgId) return badRequest("No organization found");

    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get("lead_id");
    const fileType = searchParams.get("file_type");

    let query = supabase
      .from("documents")
      .select("*")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false });

    if (leadId) {
      query = query.eq("lead_id", leadId);
    }

    if (fileType) {
      const types = fileType.split(",");
      query = query.in("file_type", types);
    }

    const { data: docs, error } = await query;

    if (error) return serverError(error);

    return successResponse(docs ?? []);
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
