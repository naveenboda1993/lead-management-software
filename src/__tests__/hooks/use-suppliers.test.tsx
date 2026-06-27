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
  useSuppliers,
  useSupplier,
  useCreateSupplier,
  useUpdateSupplier,
  useDeleteSupplier,
} from "@/hooks/use-suppliers";

const sampleSupplier = {
  id: "sup-1",
  name: "ABC Corp",
  email: "abc@corp.com",
  company: "ABC Corp",
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

describe("useSuppliers", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns suppliers on success", async () => {
    mockSelect.mockReturnValue({ order: mockOrder });
    mockOrder.mockResolvedValue({ data: [sampleSupplier], error: null });
    const { result } = renderHook(() => useSuppliers(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });

  it("returns empty array when no data", async () => {
    mockSelect.mockReturnValue({ order: mockOrder });
    mockOrder.mockResolvedValue({ data: null, error: null });
    const { result } = renderHook(() => useSuppliers(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});

describe("useSupplier", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns a single supplier", async () => {
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ single: mockSingle });
    mockSingle.mockResolvedValue({ data: sampleSupplier, error: null });
    const { result } = renderHook(() => useSupplier("sup-1"), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.name).toBe("ABC Corp");
  });

  it("is disabled when id is undefined", () => {
    const { result } = renderHook(() => useSupplier(undefined), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useCreateSupplier", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("creates a supplier successfully", async () => {
    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return {
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: sampleSupplier, error: null })),
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

    const { result } = renderHook(() => useCreateSupplier(), { wrapper: createWrapper() });
    result.current.mutate({ name: "ABC Corp", company: "ABC Corp" });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useUpdateSupplier", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("updates a supplier successfully", async () => {
    mockFrom.mockReturnValue({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: sampleSupplier, error: null })),
          })),
        })),
      })),
    });

    const { result } = renderHook(() => useUpdateSupplier(), { wrapper: createWrapper() });
    result.current.mutate({ id: "sup-1", name: "Updated Corp" });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useDeleteSupplier", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("deletes a supplier successfully", async () => {
    mockFrom.mockReturnValue({
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    });

    const { result } = renderHook(() => useDeleteSupplier(), { wrapper: createWrapper() });
    result.current.mutate("sup-1");
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
