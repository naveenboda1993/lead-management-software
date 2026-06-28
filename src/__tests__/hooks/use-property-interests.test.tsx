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
  usePropertyInterestsByLead,
  usePropertyInterestsByProperty,
  useCreatePropertyInterest,
  useUpdatePropertyInterest,
  useDeletePropertyInterest,
} from "@/hooks/use-property-interests";

const sampleInterest = {
  id: "pi-1",
  lead_id: "lead-1",
  property_id: "prop-1",
  interest_level: "HIGH",
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

describe("usePropertyInterestsByLead", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns interests on success", async () => {
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ order: mockOrder });
    mockOrder.mockResolvedValue({ data: [sampleInterest], error: null });
    const { result } = renderHook(() => usePropertyInterestsByLead("lead-1"), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });

  it("is disabled when leadId is undefined", () => {
    const { result } = renderHook(() => usePropertyInterestsByLead(undefined), {
      wrapper: createWrapper(),
    });
    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("usePropertyInterestsByProperty", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns interests on success", async () => {
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ order: mockOrder });
    mockOrder.mockResolvedValue({ data: [sampleInterest], error: null });
    const { result } = renderHook(() => usePropertyInterestsByProperty("prop-1"), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });

  it("is disabled when propertyId is undefined", () => {
    const { result } = renderHook(() => usePropertyInterestsByProperty(undefined), {
      wrapper: createWrapper(),
    });
    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useCreatePropertyInterest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates an interest successfully", async () => {
    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() =>
                Promise.resolve({ data: { organization_id: "org-1" }, error: null })
              ),
            })),
          })),
        };
      }
      return {
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: sampleInterest, error: null })),
          })),
        })),
      };
    });

    const { result } = renderHook(() => useCreatePropertyInterest(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({
      lead_id: "lead-1",
      property_id: "prop-1",
      interest_level: "HIGH",
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useUpdatePropertyInterest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates an interest successfully", async () => {
    mockFrom.mockReturnValue({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: sampleInterest, error: null })),
          })),
        })),
      })),
    });

    const { result } = renderHook(() => useUpdatePropertyInterest(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({ id: "pi-1", interest_level: "LOW" });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useDeletePropertyInterest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes an interest successfully", async () => {
    mockFrom.mockReturnValue({
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    });

    const { result } = renderHook(() => useDeletePropertyInterest(), {
      wrapper: createWrapper(),
    });
    result.current.mutate("pi-1");
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("usePropertyInterestsByLead empty array", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockImplementation(() => ({ select: mockSelect, order: mockOrder, eq: mockEq, single: mockSingle }));
  });

  it("returns empty array when data is null", async () => {
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ order: mockOrder });
    mockOrder.mockResolvedValue({ data: null, error: null });
    const { result } = renderHook(() => usePropertyInterestsByLead("lead-1"), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});
