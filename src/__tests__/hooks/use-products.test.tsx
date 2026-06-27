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
  useProducts,
  useProduct,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useInventory,
  useUpdateInventory,
} from "@/hooks/use-products";

const sampleProduct = {
  id: "prod-1",
  name: "Widget Pro",
  sku: "WGT-001",
  price: 29.99,
  category: "ELECTRONICS",
  is_active: true,
  created_at: "2024-01-01T00:00:00Z",
  organization_id: "org-1",
};

const sampleInventory = {
  product_id: "prod-1",
  quantity: 100,
};

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe("useProducts", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns products on success", async () => {
    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ order: mockOrder });
    mockOrder.mockResolvedValue({ data: [sampleProduct], error: null });

    const { result } = renderHook(() => useProducts(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });

  it("returns empty array when no data", async () => {
    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ order: mockOrder });
    mockOrder.mockResolvedValue({ data: null, error: null });

    const { result } = renderHook(() => useProducts(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});

describe("useProduct", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns a single product", async () => {
    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ single: mockSingle });
    mockSingle.mockResolvedValue({ data: sampleProduct, error: null });

    const { result } = renderHook(() => useProduct("prod-1"), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.name).toBe("Widget Pro");
  });

  it("is disabled when id is undefined", () => {
    const { result } = renderHook(() => useProduct(undefined), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useCreateProduct", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("creates a product successfully", async () => {
    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return {
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: sampleProduct, error: null })),
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

    const { result } = renderHook(() => useCreateProduct(), { wrapper: createWrapper() });
    result.current.mutate({ name: "Widget Pro", price: 29.99 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useUpdateProduct", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("updates a product successfully", async () => {
    mockFrom.mockReturnValue({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: sampleProduct, error: null })),
          })),
        })),
      })),
    });

    const { result } = renderHook(() => useUpdateProduct(), { wrapper: createWrapper() });
    result.current.mutate({ id: "prod-1", price: 39.99 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useDeleteProduct", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("deletes a product successfully", async () => {
    mockFrom.mockReturnValue({
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    });

    const { result } = renderHook(() => useDeleteProduct(), { wrapper: createWrapper() });
    result.current.mutate("prod-1");
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useInventory", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns inventory on success", async () => {
    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockResolvedValue({ data: [sampleInventory], error: null });

    const { result } = renderHook(() => useInventory(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });
});

describe("useUpdateInventory", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("updates inventory successfully", async () => {
    mockFrom.mockReturnValue({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: sampleInventory, error: null })),
          })),
        })),
      })),
    });

    const { result } = renderHook(() => useUpdateInventory(), { wrapper: createWrapper() });
    result.current.mutate({ product_id: "prod-1", quantity: 200 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
