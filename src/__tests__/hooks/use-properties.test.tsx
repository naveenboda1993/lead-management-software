import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

const { mockSelect, mockEq, mockOrder, mockSingle, mockOr, mockLte, mockGte, mockFrom } = vi.hoisted(() => {
  const mockSelect = vi.fn();
  const mockEq = vi.fn();
  const mockOrder = vi.fn();
  const mockSingle = vi.fn();
  const mockOr = vi.fn();
  const mockLte = vi.fn();
  const mockGte = vi.fn();
  const mockFrom = vi.fn(() => ({
    select: mockSelect,
    order: mockOrder,
    eq: mockEq,
    single: mockSingle,
    or: mockOr,
    lte: mockLte,
    gte: mockGte,
  }));
  return { mockSelect, mockEq, mockOrder, mockSingle, mockOr, mockLte, mockGte, mockFrom };
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
  useProperties,
  useProperty,
  useCreateProperty,
  useUpdateProperty,
  useDeleteProperty,
  useBrokers,
} from "@/hooks/use-properties";

const sampleProperty = {
  id: "prop-1",
  property_name: "Luxury Villa",
  property_type: "VILLA",
  price: 500000,
  status: "AVAILABLE",
  created_at: "2024-01-01T00:00:00Z",
  organization_id: "org-1",
};

const sampleBroker = {
  id: "brk-1",
  name: "John Doe",
  email: "john@example.com",
  created_at: "2024-01-01T00:00:00Z",
};

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe("useProperties", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns properties on success", async () => {
    mockSelect.mockReturnValue({ order: mockOrder });
    mockOrder.mockResolvedValue({ data: [sampleProperty], error: null });
    const { result } = renderHook(() => useProperties(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });

  it("returns empty array when no data", async () => {
    mockSelect.mockReturnValue({ order: mockOrder });
    mockOrder.mockResolvedValue({ data: null, error: null });
    const { result } = renderHook(() => useProperties(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});

describe("useProperty", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns a single property", async () => {
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ single: mockSingle });
    mockSingle.mockResolvedValue({ data: sampleProperty, error: null });
    const { result } = renderHook(() => useProperty("prop-1"), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.property_name).toBe("Luxury Villa");
  });

  it("is disabled when id is undefined", () => {
    const { result } = renderHook(() => useProperty(undefined), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useCreateProperty", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("creates a property successfully", async () => {
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
            single: vi.fn(() => Promise.resolve({ data: sampleProperty, error: null })),
          })),
        })),
      });

    const { result } = renderHook(() => useCreateProperty(), { wrapper: createWrapper() });
    result.current.mutate({ property_name: "New Property", property_type: "APARTMENT", price: 300000 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useUpdateProperty", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("updates a property successfully", async () => {
    mockFrom.mockReturnValue({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: sampleProperty, error: null })),
          })),
        })),
      })),
    });

    const { result } = renderHook(() => useUpdateProperty(), { wrapper: createWrapper() });
    result.current.mutate({ id: "prop-1", price: 550000 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useDeleteProperty", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("deletes a property successfully", async () => {
    mockFrom.mockReturnValue({
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    });

    const { result } = renderHook(() => useDeleteProperty(), { wrapper: createWrapper() });
    result.current.mutate("prop-1");
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useBrokers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockImplementation(() => ({ select: mockSelect, order: mockOrder, eq: mockEq, single: mockSingle, or: mockOr, lte: mockLte, gte: mockGte }));
  });

  it("returns brokers on success", async () => {
    mockSelect.mockReturnValue({ order: mockOrder });
    mockOrder.mockResolvedValue({ data: [sampleBroker], error: null });
    const { result } = renderHook(() => useBrokers(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });
});
