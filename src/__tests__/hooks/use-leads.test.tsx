import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

const { mockSelect, mockEq, mockOrder, mockSingle, mockOr, mockFrom } = vi.hoisted(() => {
  const mockSelect = vi.fn();
  const mockEq = vi.fn();
  const mockOrder = vi.fn();
  const mockOr = vi.fn();
  const mockSingle = vi.fn();
  const mockFrom = vi.fn(() => ({
    select: mockSelect,
    order: mockOrder,
  }));
  return { mockSelect, mockEq, mockOrder, mockSingle, mockOr, mockFrom };
});

vi.mock("@/lib/supabase/client", () => {
  const mockAuthGetUser = vi.fn(() =>
    Promise.resolve({ data: { user: { id: "user-1" } }, error: null })
  );
  return {
    createClient: () => ({
      from: mockFrom,
      auth: { getUser: mockAuthGetUser },
    }),
  };
});

vi.mock("@/lib/utils/cn", () => ({
  cn: (...inputs: unknown[]) => inputs.filter(Boolean).join(" "),
}));

import {
  useLeads,
  useLead,
  useLeadActivities,
} from "@/hooks/use-leads";

const mockLead = {
  id: "lead-1",
  first_name: "John",
  last_name: "Doe",
  email: "john@example.com",
  mobile: "1234567890",
  lead_source: "manual_entry",
  status: "new",
  priority: "medium",
  created_at: "2024-01-01T00:00:00Z",
  organization_id: "org-1",
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("useLeads", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns leads data on success", async () => {
    mockSelect.mockReturnValue({ order: mockOrder });
    mockOrder.mockResolvedValue({ data: [mockLead], error: null });

    const { result } = renderHook(() => useLeads(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].first_name).toBe("John");
  });

  it("returns empty array when no data", async () => {
    mockSelect.mockReturnValue({ order: mockOrder });
    mockOrder.mockResolvedValue({ data: null, error: null });

    const { result } = renderHook(() => useLeads(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});

describe("useLead", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a single lead", async () => {
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ single: mockSingle });
    mockSingle.mockResolvedValue({ data: mockLead, error: null });

    const { result } = renderHook(() => useLead("lead-1"), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.first_name).toBe("John");
  });

  it("is disabled when id is undefined", () => {
    const { result } = renderHook(() => useLead(undefined), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useLeadActivities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches activities for a lead", async () => {
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ order: mockOrder });
    mockOrder.mockResolvedValue({ data: [{ id: "act-1", description: "Called lead" }], error: null });

    const { result } = renderHook(() => useLeadActivities("lead-1"), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].description).toBe("Called lead");
  });

  it("is disabled when leadId is undefined", () => {
    const { result } = renderHook(() => useLeadActivities(undefined), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe("idle");
  });
});
