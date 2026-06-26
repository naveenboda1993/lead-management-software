import {
  getAuthenticatedUser,
  getOrganizationId,
  successResponse,
  badRequest,
  serverError,
} from "@/lib/api/utils";

export async function GET() {
  try {
    const { user, supabase } = await getAuthenticatedUser();
    if (!user) return unauthorized();

    const orgId = await getOrganizationId(supabase, user.id);
    if (!orgId) return badRequest("No organization found");

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const { count: pendingTasks } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("assigned_to", user.id)
      .eq("status", "PENDING");

    const { count: completedTasks } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("assigned_to", user.id)
      .eq("status", "COMPLETED");

    const { count: attendanceThisMonth } = await supabase
      .from("attendance")
      .select("*", { count: "exact", head: true })
      .eq("employee_id", user.id)
      .gte("date", startOfMonth.toISOString())
      .lte("date", endOfMonth.toISOString());

    const { count: upcomingLeaves } = await supabase
      .from("leaves")
      .select("*", { count: "exact", head: true })
      .eq("employee_id", user.id)
      .eq("status", "APPROVED")
      .gte("start_date", now.toISOString());

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 86400000);

    const { data: todaysTasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("assigned_to", user.id)
      .gte("due_date", todayStart.toISOString())
      .lt("due_date", todayEnd.toISOString())
      .order("due_date", { ascending: true });

    const { data: recentLeads } = await supabase
      .from("leads")
      .select("id, first_name, last_name, status, lead_source, created_at")
      .eq("assigned_to", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    return successResponse({
      pendingTasks: pendingTasks ?? 0,
      completedTasks: completedTasks ?? 0,
      attendanceThisMonth: attendanceThisMonth ?? 0,
      upcomingLeaves: upcomingLeaves ?? 0,
      todaysTasks: todaysTasks ?? [],
      recentLeadsAssigned: recentLeads ?? [],
    });
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
