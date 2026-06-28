import { NextRequest } from "next/server";
import {
  getAuthenticatedUser,
  getOrganizationId,
  successResponse,
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
    if (!orgId) return notFound("Organization");

    const { data: doc, error } = await supabase
      .from("documents")
      .select("*")
      .eq("id", id)
      .eq("organization_id", orgId)
      .single();

    if (error || !doc) return notFound("Document");

    const { data: signedUrlData } = await supabase.storage
      .from("documents")
      .createSignedUrl(doc.file_path, 3600);

    return successResponse({
      ...doc,
      signed_url: signedUrlData?.signedUrl ?? null,
    });
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
    if (!orgId) return notFound("Organization");

    const { data: doc, error: fetchError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", id)
      .eq("organization_id", orgId)
      .single();

    if (fetchError || !doc) return notFound("Document");

    if (doc.file_path) {
      await supabase.storage.from("documents").remove([doc.file_path]);
    }

    const { error: deleteError } = await supabase
      .from("documents")
      .delete()
      .eq("id", id);

    if (deleteError) return serverError(deleteError);

    return successResponse({ message: "Document deleted successfully" });
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
