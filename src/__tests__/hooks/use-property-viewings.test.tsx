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
  useViewingsByInterest,
  useViewingsByProperty,
  useViewingsByLead,
  useCreatePropertyViewing,
  useUpdatePropertyViewing,
  useDeletePropertyViewing,
} from "@/hooks/use-property-viewings";

const sampleViewing = {
  id: "pv-1",
  property_interest_id: "pi-1",
  lead_id: "lead-1",
  property_id: "prop-1",
  scheduled_at: "2024-01-15T10:00:00Z",
  status: "SCHEDULED",
  created_at: "2024-01-01T00:00:00Z",
  organization_id: "org-1",
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useViewingsByInterest", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns viewings on success", async () => {
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ order: mockOrder });
    mockOrder.mockResolvedValue({ data: [sampleViewing], error: null });
    const { result } = renderHook(() => useViewingsByInterest("pi-1"), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].id).toBe("pv-1");
  });

  it("is disabled when id is undefined", () => {
    const { result } = renderHook(() => useViewingsByInterest(undefined), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useViewingsByProperty", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns viewings on success", async () => {
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ order: mockOrder });
    mockOrder.mockResolvedValue({ data: [sampleViewing], error: null });
    const { result } = renderHook(() => useViewingsByProperty("prop-1"), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });

  it("is disabled when id is undefined", () => {
    const { result } = renderHook(() => useViewingsByProperty(undefined), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useViewingsByLead", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns viewings on success", async () => {
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ order: mockOrder });
    mockOrder.mockResolvedValue({ data: [sampleViewing], error: null });
    const { result } = renderHook(() => useViewingsByLead("lead-1"), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });

  it("is disabled when id is undefined", () => {
    const { result } = renderHook(() => useViewingsByLead(undefined), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useCreatePropertyViewing", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("creates a viewing successfully", async () => {
    mockFrom
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() =>
              Promise.resolve({ data: { organization_id: "org-1" }, error: null })
            ),
          })),
        })),
      })
      .mockReturnValueOnce({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: sampleViewing, error: null })),
          })),
        })),
      });

    const { result } = renderHook(() => useCreatePropertyViewing(), { wrapper: createWrapper() });
    result.current.mutate({ property_interest_id: "pi-1", property_id: "prop-1" });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useUpdatePropertyViewing", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("updates a viewing successfully", async () => {
    mockFrom.mockReturnValue({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: sampleViewing, error: null })),
          })),
        })),
      })),
    });

    const { result } = renderHook(() => useUpdatePropertyViewing(), { wrapper: createWrapper() });
    result.current.mutate({ id: "pv-1", status: "COMPLETED" });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useDeletePropertyViewing", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("deletes a viewing successfully", async () => {
    mockFrom.mockReturnValue({
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    });

    const { result } = renderHook(() => useDeletePropertyViewing(), { wrapper: createWrapper() });
    result.current.mutate("pv-1");
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("Property viewings (empty data)", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns empty array when data is null", async () => {
    mockFrom.mockReturnValue({
      select: mockSelect,
      order: mockOrder,
      eq: mockEq,
      single: mockSingle,
    });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ order: mockOrder });
    mockOrder.mockResolvedValue({ data: null, error: null });
    const { result } = renderHook(() => useViewingsByInterest("pi-1"), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});
