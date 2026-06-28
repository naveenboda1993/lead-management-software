import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

const { mockSelectFn, mockEq, mockOrderFn, mockSingle, mockFrom } = vi.hoisted(() => {
  const mockSelectFn = vi.fn();
  const mockEq = vi.fn();
  const mockOrderFn = vi.fn();
  const mockSingle = vi.fn();
  const mockFrom = vi.fn(() => ({
    select: mockSelectFn,
    order: mockOrderFn,
    eq: mockEq,
    single: mockSingle,
  }));
  return { mockSelectFn, mockEq, mockOrderFn, mockSingle, mockFrom };
});

vi.mock("@/lib/supabase/client", () => {
  const mockAuthGetUser = vi.fn(() => Promise.resolve({ data: { user: { id: "user-1" } }, error: null }));
  return { createClient: () => ({ from: mockFrom, auth: { getUser: mockAuthGetUser } }) };
});

vi.mock("@/lib/utils/cn", () => ({ cn: (...inputs: unknown[]) => inputs.filter(Boolean).join(" ") }));

import { useOrders, useOrder, useCreateOrder, useUpdateOrder, useDeleteOrder } from "@/hooks/use-orders";

const sampleOrder = {
  id: "ord-1", order_number: "ORD-001", status: "PENDING", total_amount: 1500,
  customer_id: "cust-1", created_at: "2024-01-01T00:00:00Z", organization_id: "org-1",
};

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return ({ children }: { children: ReactNode }) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe("useOrders", () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it("returns orders on success", async () => {
    mockSelectFn.mockReturnValue({ order: mockOrderFn });
    mockOrderFn.mockResolvedValue({ data: [sampleOrder], error: null });
    const { result } = renderHook(() => useOrders(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });
  it("returns empty array when no data", async () => {
    mockSelectFn.mockReturnValue({ order: mockOrderFn });
    mockOrderFn.mockResolvedValue({ data: null, error: null });
    const { result } = renderHook(() => useOrders(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});

describe("useOrder", () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it("returns a single order", async () => {
    mockSelectFn.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ single: mockSingle });
    mockSingle.mockResolvedValue({ data: sampleOrder, error: null });
    const { result } = renderHook(() => useOrder("ord-1"), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.order_number).toBe("ORD-001");
  });
  it("is disabled when id is undefined", () => {
    const { result } = renderHook(() => useOrder(undefined), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useCreateOrder", () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it("creates an order successfully", async () => {
    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return {
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: sampleOrder, error: null })),
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
    const { result } = renderHook(() => useCreateOrder(), { wrapper: createWrapper() });
    result.current.mutate({ customer_id: "cust-1", total_amount: 1500 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useUpdateOrder", () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it("updates an order successfully", async () => {
    mockFrom.mockReturnValue({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: sampleOrder, error: null })),
          })),
        })),
      })),
    });
    const { result } = renderHook(() => useUpdateOrder(), { wrapper: createWrapper() });
    result.current.mutate({ id: "ord-1", status: "CONFIRMED" });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useDeleteOrder", () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it("deletes an order successfully", async () => {
    mockFrom.mockReturnValue({
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    });
    const { result } = renderHook(() => useDeleteOrder(), { wrapper: createWrapper() });
    result.current.mutate("ord-1");
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
