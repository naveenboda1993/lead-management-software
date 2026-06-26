import {
  getAuthenticatedUser,
  getOrganizationId,
  successResponse,
  badRequest,
  serverError,
} from "@/lib/api/utils";
import { LeadStatus } from "@/types";

export async function GET() {
  try {
    const { user, supabase } = await getAuthenticatedUser();
    if (!user) return unauthorized();

    const orgId = await getOrganizationId(supabase, user.id);
    if (!orgId) return badRequest("No organization found");

    const { data: leads } = await supabase
      .from("leads")
      .select("*")
      .eq("organization_id", orgId);

    const allLeads = leads ?? [];

    const statusCount = new Map<string, number>();
    const statusValue = new Map<string, number>();
    for (const l of allLeads) {
      const s = l.status as string;
      statusCount.set(s, (statusCount.get(s) ?? 0) + 1);
      statusValue.set(s, (statusValue.get(s) ?? 0) + ((l.estimated_deal_value as number) ?? 0));
    }

    const wonDeals = statusCount.get(LeadStatus.WON) ?? 0;
    const lostDeals = statusCount.get(LeadStatus.LOST) ?? 0;
    const totalClosed = wonDeals + lostDeals;

    const wonValue = statusValue.get(LeadStatus.WON) ?? 0;
    const pipelineValue = allLeads
      .filter((l: Record<string, unknown>) => l.status !== LeadStatus.LOST && l.status !== LeadStatus.WON)
      .reduce((sum: number, l: Record<string, unknown>) => sum + ((l.estimated_deal_value as number) ?? 0), 0);

    const conversionRate = totalClosed > 0 ? Math.round((wonDeals / totalClosed) * 100) : 0;

    const pipelineByStage = Object.values(LeadStatus)
      .filter((s) => s !== LeadStatus.WON && s !== LeadStatus.LOST)
      .map((stage) => ({
        stage,
        count: statusCount.get(stage) ?? 0,
        value: statusValue.get(stage) ?? 0,
      }));

    const monthlyRevenue: { month: string; revenue: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const label = `${year}-${month}`;
      const monthWon = allLeads.filter(
        (l: Record<string, unknown>) =>
          l.status === LeadStatus.WON &&
          new Date(l.created_at as string).getFullYear() === year &&
          new Date(l.created_at as string).getMonth() === d.getMonth()
      );
      monthlyRevenue.push({
        month: label,
        revenue: monthWon.reduce((s: number, l: Record<string, unknown>) => s + ((l.estimated_deal_value as number) ?? 0), 0),
      });
    }

    const ownerMap = new Map<string, { deals: number; revenue: number }>();
    for (const l of allLeads) {
      const ownerId = l.assigned_to as string | null;
      if (!ownerId) continue;
      const entry = ownerMap.get(ownerId) ?? { deals: 0, revenue: 0 };
      if (l.status === LeadStatus.WON) {
        entry.deals++;
        entry.revenue += (l.estimated_deal_value as number) ?? 0;
      }
      ownerMap.set(ownerId, entry);
    }

    const topPerformers = await Promise.all(
      Array.from(ownerMap.entries())
        .sort((a, b) => b[1].revenue - a[1].revenue)
        .slice(0, 5)
        .map(async ([userId, stats]) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", userId)
            .single();
          return {
            name: (profile as { full_name?: string } | null)?.full_name ?? "Unknown",
            deals: stats.deals,
            revenue: stats.revenue,
          };
        })
    );

    const recentDeals = allLeads
      .filter((l: Record<string, unknown>) => l.status === LeadStatus.WON || l.status === LeadStatus.LOST)
      .sort((a: Record<string, unknown>, b: Record<string, unknown>) => new Date(b.updated_at as string).getTime() - new Date(a.updated_at as string).getTime())
      .slice(0, 5)
      .map((l: Record<string, unknown>) => ({
        id: l.id,
        first_name: l.first_name,
        last_name: l.last_name,
        status: l.status,
        estimated_deal_value: l.estimated_deal_value,
        updated_at: l.updated_at,
      }));

    return successResponse({
      pipelineValue,
      wonDeals,
      lostDeals,
      avgDealSize: wonDeals > 0 ? Math.round(wonValue / wonDeals) : 0,
      conversionRate,
      pipelineByStage,
      monthlyRevenue,
      topPerformers,
      recentDeals,
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
