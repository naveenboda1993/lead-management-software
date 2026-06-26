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

    const { count: totalLeads } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", orgId);

    const { count: totalEmployees } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", orgId);

    const { data: orders } = await supabase
      .from("orders")
      .select("total_amount")
      .eq("organization_id", orgId);

    const totalRevenue = (orders ?? []).reduce(
      (sum: number, o: { total_amount: number }) => sum + (o.total_amount ?? 0),
      0
    );

    const { data: campaigns } = await supabase
      .from("campaigns")
      .select("id, status, name, sent_count, opened_count, clicked_count, converted_count")
      .eq("organization_id", orgId);

    const marketingSpend = (campaigns ?? []).reduce(
      (sum: number, c: { sent_count: number }) => sum + (c.sent_count ?? 0) * 0.5,
      0
    );

    const activeCampaigns = (campaigns ?? []).filter(
      (c: { status: string }) => c.status === "RUNNING"
    ).length;

    const { data: leads } = await supabase
      .from("leads")
      .select("lead_source, estimated_deal_value, status, created_at, first_name, last_name, id, assigned_to")
      .eq("organization_id", orgId);

    const allLeads: Record<string, unknown>[] = leads ?? [];

    const sourceCount = new Map<string, number>();
    for (const l of allLeads) {
      const src = l.lead_source as string;
      sourceCount.set(src, (sourceCount.get(src) ?? 0) + 1);
    }

    const leadsBySource = Array.from(sourceCount.entries()).map(([source, count]) => ({
      source,
      count,
    }));

    const revenueByMonth: { month: string; revenue: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const label = `${year}-${month}`;
      const monthOrders = (orders ?? []).filter((o: Record<string, unknown>) => {
        const created = new Date(o.created_at as string);
        return created.getFullYear() === year && created.getMonth() === d.getMonth();
      });
      revenueByMonth.push({
        month: label,
        revenue: monthOrders.reduce((s: number, o: Record<string, unknown>) => s + (Number(o.total_amount) || 0), 0),
      });
    }

    const ownerMap = new Map<string, { leads: number; conversions: number }>();
    for (const l of allLeads) {
      const ownerId = l.assigned_to as string | null;
      if (!ownerId) continue;
      const entry = ownerMap.get(ownerId) ?? { leads: 0, conversions: 0 };
      entry.leads++;
      if (l.status as string === "WON") entry.conversions++;
      ownerMap.set(ownerId, entry);
    }

    const employeePerformance = await Promise.all(
      Array.from(ownerMap.entries()).map(async ([userId, stats]) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", userId)
          .single();
        return {
          name: (profile as { full_name?: string } | null)?.full_name ?? "Unknown",
          leads: stats.leads,
          conversions: stats.conversions,
        };
      })
    );

    const { data: properties } = await supabase
      .from("properties")
      .select("id")
      .eq("organization_id", orgId);

    const { data: pendingOrders } = await supabase
      .from("orders")
      .select("id")
      .eq("organization_id", orgId)
      .in("status", ["PENDING", "PROCESSING"]);

    const recentLeads = allLeads.slice(0, 5).map((l: Record<string, unknown>) => ({
      id: l.id,
      first_name: l.first_name,
      last_name: l.last_name,
      email: l.email,
      status: l.status,
      created_at: l.created_at,
    }));

    const activeCamps = (campaigns ?? [])
      .filter((c: { status: string }) => c.status === "RUNNING")
      .slice(0, 5)
      .map((c: Record<string, unknown>) => ({
        id: c.id,
        name: c.name,
        sent_count: c.sent_count,
        opened_count: c.opened_count,
        clicked_count: c.clicked_count,
        converted_count: c.converted_count,
      }));

    return successResponse({
      totalRevenue,
      totalLeads: totalLeads ?? 0,
      totalEmployees: totalEmployees ?? 0,
      marketingSpend: Math.round(marketingSpend),
      leadsBySource,
      revenueByMonth,
      employeePerformance,
      propertiesListed: properties?.length ?? 0,
      ordersPending: pendingOrders?.length ?? 0,
      activeCampaigns,
      recentLeads,
      activeCampaignsList: activeCamps,
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
