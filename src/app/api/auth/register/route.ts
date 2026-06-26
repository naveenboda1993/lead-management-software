import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";
import { successResponse, badRequest, serverError } from "@/lib/api/utils";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  organization_name: z.string().min(1, "Organization name is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((e: { message: string }) => e.message).join(", "));
    }

    const { email, password, full_name, organization_name } = parsed.data;
    const adminClient = createAdminClient();
    const supabase = await createClient();

    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      return badRequest(authError.message);
    }

    const userId = authData.user.id;
    const orgSlug = organization_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .insert({
        name: organization_name,
        slug: orgSlug,
        settings: {
          timezone: "UTC",
          currency: "USD",
          date_format: "MM/DD/YYYY",
          business_hours: { start: "09:00", end: "18:00" },
          weekend_leads_assignment: false,
        },
      })
      .select()
      .single();

    if (orgError) {
      await adminClient.auth.admin.deleteUser(userId);
      return badRequest("Failed to create organization: " + orgError.message);
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      email,
      full_name,
      role: "sales_executive",
      organization_id: org.id,
    });

    if (profileError) {
      await supabase.from("organizations").delete().eq("id", org.id);
      await adminClient.auth.admin.deleteUser(userId);
      return badRequest("Failed to create profile: " + profileError.message);
    }

    const { data: sessionData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (signInError) {
      return successResponse({
        message: "Account created successfully. Please sign in.",
        user: authData.user,
      });
    }

    return successResponse(
      {
        user: sessionData.user,
        session: sessionData.session,
        organization: org,
      },
      201
    );
  } catch (error) {
    return serverError(error);
  }
}
