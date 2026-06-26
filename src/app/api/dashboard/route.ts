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

    const totalLeads = allLeads.length;

    const newLeadsThisMonth = allLeads.filter((l: Record<string, unknown>) => {
      const created = new Date(l.created_at as string);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length;

    const statusCount = new Map<string, number>();
    for (const l of allLeads) {
      const s = l.status as string;
      statusCount.set(s, (statusCount.get(s) ?? 0) + 1);
    }

    const leadsByStatus = Array.from(statusCount.entries()).map(([status, count]) => ({
      status,
      count,
    }));

    const sourceCount = new Map<string, number>();
    for (const l of allLeads) {
      const s = l.lead_source as string;
      sourceCount.set(s, (sourceCount.get(s) ?? 0) + 1);
    }

    const leadsBySource = Array.from(sourceCount.entries()).map(([source, count]) => ({
      source,
      count,
    }));

    const qualifiedLeads = statusCount.get(LeadStatus.QUALIFIED) ?? 0;
    const wonLeads = statusCount.get(LeadStatus.WON) ?? 0;
    const lostLeads = statusCount.get(LeadStatus.LOST) ?? 0;

    const totalClosed = wonLeads + lostLeads;
    const conversionRate = totalClosed > 0 ? Math.round((wonLeads / totalClosed) * 100) : 0;

    const wonValue = allLeads
      .filter((l: Record<string, unknown>) => l.status === LeadStatus.WON)
      .reduce((sum: number, l: Record<string, unknown>) => sum + ((l.estimated_deal_value as number) ?? 0), 0);

    const negotiationValue = allLeads
      .filter((l: Record<string, unknown>) => l.status === LeadStatus.NEGOTIATION)
      .reduce((sum: number, l: Record<string, unknown>) => sum + ((l.estimated_deal_value as number) ?? 0), 0);

    const revenueForecast = wonValue + Math.round(negotiationValue * 0.6);

    const monthlyConversions: { month: string; won: number; lost: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const label = `${year}-${month}`;

      const monthLeads = allLeads.filter((l: Record<string, unknown>) => {
        const created = new Date(l.created_at as string);
        return created.getFullYear() === year && created.getMonth() === d.getMonth();
      });

      monthlyConversions.push({
        month: label,
        won: monthLeads.filter((l: Record<string, unknown>) => l.status === LeadStatus.WON).length,
        lost: monthLeads.filter((l: Record<string, unknown>) => l.status === LeadStatus.LOST).length,
      });
    }

    const teamMap = new Map<string, { total: number; won: number; value: number }>();
    for (const l of allLeads) {
      const ownerId = l.assigned_to as string | null;
      if (!ownerId) continue;
      const entry = teamMap.get(ownerId) ?? { total: 0, won: 0, value: 0 };
      entry.total++;
      if (l.status === LeadStatus.WON) {
        entry.won++;
        entry.value += (l.estimated_deal_value as number) ?? 0;
      }
      teamMap.set(ownerId, entry);
    }

    const teamPerformance = await Promise.all(
      Array.from(teamMap.entries()).map(async ([userId, stats]) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", userId)
          .single();
        return {
          user_id: userId,
          full_name: (profile as { full_name?: string } | null)?.full_name ?? "Unknown",
          email: (profile as { email?: string } | null)?.email ?? "",
          ...stats,
        };
      })
    );

    return successResponse({
      total_leads: totalLeads,
      new_leads: newLeadsThisMonth,
      qualified_leads: qualifiedLeads,
      won_leads: wonLeads,
      lost_leads: lostLeads,
      conversion_rate: conversionRate,
      revenue_forecast: revenueForecast,
      leads_by_source: leadsBySource,
      leads_by_status: leadsByStatus,
      monthly_conversions: monthlyConversions,
      team_performance: teamPerformance,
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
