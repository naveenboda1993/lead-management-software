"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { LeadStatus, type Lead, type Task, type DashboardMetrics } from "@/types";

const supabase = createClient();

async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  const allLeads = (leads ?? []) as Lead[];

  const totalLeads = allLeads.length;

  const statusCounts = Object.values(LeadStatus).map((status) => ({
    status,
    count: allLeads.filter((l) => l.status === status).length,
  }));

  const sourceMap = new Map<string, number>();
  for (const lead of allLeads) {
    const source = lead.lead_source;
    sourceMap.set(source, (sourceMap.get(source) ?? 0) + 1);
  }
  const leadsBySource = Array.from(sourceMap.entries()).map(([source, count]) => ({
    source: source as DashboardMetrics["leadsBySource"][number]["source"],
    count,
  }));

  const priorityMap = new Map<string, number>();
  for (const lead of allLeads) {
    const priority = lead.priority;
    priorityMap.set(priority, (priorityMap.get(priority) ?? 0) + 1);
  }
  const leadsByPriority = Array.from(priorityMap.entries()).map(([priority, count]) => ({
    priority: priority as DashboardMetrics["leadsByPriority"][number]["priority"],
    count,
  }));

  const wonLeads = allLeads.filter((l) => l.status === LeadStatus.WON);
  const totalDealValue = wonLeads.reduce(
    (sum, l) => sum + (l.estimated_deal_value ?? 0),
    0
  );

  const conversionRate =
    totalLeads > 0
      ? Math.round((wonLeads.length / totalLeads) * 100)
      : 0;

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*");

  const allTasks = (tasks ?? []) as Task[];
  const tasksCompleted = allTasks.filter((t) => t.status === "completed").length;
  const tasksPending = allTasks.filter((t) => t.status === "pending").length;

  const upcomingTasks = allTasks
    .filter((t) => t.status === "pending")
    .sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    })
    .slice(0, 5) as DashboardMetrics["upcomingTasks"];

  return {
    totalLeads,
    leadsByStatus: statusCounts,
    leadsBySource,
    leadsByPriority,
    recentLeads: allLeads.slice(0, 5) as DashboardMetrics["recentLeads"],
    upcomingTasks,
    conversionRate,
    totalDealValue,
    averageDealValue: wonLeads.length > 0 ? Math.round(totalDealValue / wonLeads.length) : 0,
    tasksCompleted,
    tasksPending,
  };
}

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardMetrics,
    refetchInterval: 60 * 1000,
  });
}
