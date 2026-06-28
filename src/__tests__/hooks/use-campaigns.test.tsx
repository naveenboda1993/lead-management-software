import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

const { mockSelect, mockEq, mockOrder, mockSingle, mockFrom } = vi.hoisted(() => {
  const mockSelect = vi.fn();
  const mockEq = vi.fn();
  const mockOrder = vi.fn();
  const mockSingle = vi.fn();
  const mockFrom = vi.fn(() => ({
    select: mockSelect,
    order: mockOrder,
    eq: mockEq,
    single: mockSingle,
  }));
  return { mockSelect, mockEq, mockOrder, mockSingle, mockFrom };
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
  useCampaigns,
  useCampaign,
  useCreateCampaign,
  useUpdateCampaign,
  useDeleteCampaign,
} from "@/hooks/use-campaigns";

const sampleCampaign = {
  id: "camp-1",
  name: "Summer Sale",
  type: "EMAIL",
  status: "RUNNING",
  subject: "Summer Sale!",
  content: "Get 50% off",
  created_at: "2024-01-01T00:00:00Z",
  organization_id: "org-1",
};

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe("useCampaigns", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns campaigns on success", async () => {
    mockSelect.mockReturnValue({ order: mockOrder });
    mockOrder.mockResolvedValue({ data: [sampleCampaign], error: null });
    const { result } = renderHook(() => useCampaigns(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });

  it("returns empty array when no data", async () => {
    mockSelect.mockReturnValue({ order: mockOrder });
    mockOrder.mockResolvedValue({ data: null, error: null });
    const { result } = renderHook(() => useCampaigns(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});

describe("useCampaign", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns a single campaign", async () => {
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ single: mockSingle });
    mockSingle.mockResolvedValue({ data: sampleCampaign, error: null });
    const { result } = renderHook(() => useCampaign("camp-1"), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.name).toBe("Summer Sale");
  });

  it("is disabled when id is undefined", () => {
    const { result } = renderHook(() => useCampaign(undefined), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useCreateCampaign", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("creates a campaign successfully", async () => {
    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return {
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: sampleCampaign, error: null })),
            })),
          })),
        };
      }
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: { organization_id: "org-1" }, error: null })),
          })),
        })),
      };
    });

    const { result } = renderHook(() => useCreateCampaign(), { wrapper: createWrapper() });
    result.current.mutate({ name: "New Campaign", type: "EMAIL" });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useUpdateCampaign", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("updates a campaign successfully", async () => {
    mockFrom.mockReturnValue({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: sampleCampaign, error: null })),
          })),
        })),
      })),
    });

    const { result } = renderHook(() => useUpdateCampaign(), { wrapper: createWrapper() });
    result.current.mutate({ id: "camp-1", status: "COMPLETED" });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useDeleteCampaign", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("deletes a campaign successfully", async () => {
    mockFrom.mockReturnValue({
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    });

    const { result } = renderHook(() => useDeleteCampaign(), { wrapper: createWrapper() });
    result.current.mutate("camp-1");
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
