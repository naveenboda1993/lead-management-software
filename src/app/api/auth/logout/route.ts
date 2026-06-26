import { createClient } from "@/lib/supabase/server";
import { getAuthenticatedUser, successResponse, serverError } from "@/lib/api/utils";

export async function POST() {
  try {
    const { supabase, error: authError } = await getAuthenticatedUser();
    if (authError) {
      const supabaseLocal = await createClient();
      await supabaseLocal.auth.signOut();
      return successResponse({ message: "Signed out" });
    }

    await supabase.auth.signOut();
    return successResponse({ message: "Signed out successfully" });
  } catch (error) {
    return serverError(error);
  }
}
