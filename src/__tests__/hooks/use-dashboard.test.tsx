import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { LeadStatus } from "@/types";

const { mockSelectLeads, mockOrderLeads, mockSelectTasks, mockFrom } = vi.hoisted(() => {
  const mockSelectLeads = vi.fn();
  const mockOrderLeads = vi.fn();
  const mockSelectTasks = vi.fn();
  const mockFrom = vi.fn();
  return { mockSelectLeads, mockOrderLeads, mockSelectTasks, mockFrom };
});

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ from: mockFrom }),
}));

vi.mock("@/lib/utils/cn", () => ({
  cn: (...inputs: unknown[]) => inputs.filter(Boolean).join(" "),
}));

import { useDashboard } from "@/hooks/use-dashboard";

const sampleLeads = [
  {
    id: "lead-1",
    status: "new" as const,
    priority: "high" as const,
    lead_source: "website_form" as const,
    estimated_deal_value: 50000,
    created_at: "2024-01-01T00:00:00Z",
    organization_id: "org-1",
  },
  {
    id: "lead-2",
    status: "won" as const,
    priority: "medium" as const,
    lead_source: "referral" as const,
    estimated_deal_value: 100000,
    created_at: "2024-01-02T00:00:00Z",
    organization_id: "org-1",
  },
  {
    id: "lead-3",
    status: "new" as const,
    priority: "low" as const,
    lead_source: "website_form" as const,
    estimated_deal_value: 25000,
    created_at: "2024-01-03T00:00:00Z",
    organization_id: "org-1",
  },
];

const sampleTasks = [
  {
    id: "task-1",
    status: "completed",
    due_date: "2024-01-10",
    created_at: "2024-01-01T00:00:00Z",
    organization_id: "org-1",
  },
  {
    id: "task-2",
    status: "pending",
    due_date: "2024-01-15",
    created_at: "2024-01-02T00:00:00Z",
    organization_id: "org-1",
  },
  {
    id: "task-3",
    status: "pending",
    due_date: "2024-01-20",
    created_at: "2024-01-03T00:00:00Z",
    organization_id: "org-1",
  },
];

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe("useDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns computed dashboard metrics", async () => {
    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return { select: mockSelectLeads };
      }
      return { select: mockSelectTasks };
    });

    mockSelectLeads.mockReturnValue({ order: mockOrderLeads });
    mockOrderLeads.mockResolvedValue({ data: sampleLeads, error: null });
    mockSelectTasks.mockResolvedValue({ data: sampleTasks, error: null });

    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const data = result.current.data!;
    expect(data.totalLeads).toBe(3);
    expect(data.leadsByStatus).toEqual([
      { status: "new", count: 2 },
      { status: "contacted", count: 0 },
      { status: "qualified", count: 0 },
      { status: "proposal_sent", count: 0 },
      { status: "negotiation", count: 0 },
      { status: "won", count: 1 },
      { status: "lost", count: 0 },
    ]);
    expect(data.leadsBySource).toEqual([
      { source: "website_form", count: 2 },
      { source: "referral", count: 1 },
    ]);
    expect(data.leadsByPriority).toEqual([
      { priority: "high", count: 1 },
      { priority: "medium", count: 1 },
      { priority: "low", count: 1 },
    ]);
    expect(data.conversionRate).toBe(33);
    expect(data.totalDealValue).toBe(100000);
    expect(data.averageDealValue).toBe(100000);
    expect(data.tasksCompleted).toBe(1);
    expect(data.tasksPending).toBe(2);
    expect(data.recentLeads).toHaveLength(3);
    expect(data.upcomingTasks).toHaveLength(2);
    expect(data.upcomingTasks[0].id).toBe("task-2");
    expect(data.upcomingTasks[1].id).toBe("task-3");
  });

  it("returns zero values when no data", async () => {
    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return { select: mockSelectLeads };
      }
      return { select: mockSelectTasks };
    });

    mockSelectLeads.mockReturnValue({ order: mockOrderLeads });
    mockOrderLeads.mockResolvedValue({ data: null, error: null });
    mockSelectTasks.mockResolvedValue({ data: null, error: null });

    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const data = result.current.data!;
    expect(data.totalLeads).toBe(0);
    expect(data.leadsByStatus).toEqual(
      Object.values(LeadStatus).map((status) => ({ status, count: 0 }))
    );
    expect(data.leadsBySource).toEqual([]);
    expect(data.leadsByPriority).toEqual([]);
    expect(data.conversionRate).toBe(0);
    expect(data.totalDealValue).toBe(0);
    expect(data.averageDealValue).toBe(0);
    expect(data.tasksCompleted).toBe(0);
    expect(data.tasksPending).toBe(0);
    expect(data.recentLeads).toEqual([]);
    expect(data.upcomingTasks).toEqual([]);
  });
});
