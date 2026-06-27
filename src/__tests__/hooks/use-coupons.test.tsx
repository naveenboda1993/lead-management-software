import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

const { mockSelect, mockEq, mockOrder, mockSingle, mockFrom } = vi.hoisted(() => {
  const mockSelect = vi.fn();
  const mockEq = vi.fn();
  const mockOrder = vi.fn();
  const mockSingle = vi.fn();
  const mockFrom = vi.fn(() => ({ select: mockSelect, order: mockOrder, eq: mockEq, single: mockSingle }));
  return { mockSelect, mockEq, mockOrder, mockSingle, mockFrom };
});

vi.mock("@/lib/supabase/client", () => {
  const mockAuthGetUser = vi.fn(() => Promise.resolve({ data: { user: { id: "user-1" } }, error: null }));
  return { createClient: () => ({ from: mockFrom, auth: { getUser: mockAuthGetUser } }) };
});

vi.mock("@/lib/utils/cn", () => ({ cn: (...inputs: unknown[]) => inputs.filter(Boolean).join(" ") }));

import { useCoupons, useCoupon, useCreateCoupon, useUpdateCoupon, useDeleteCoupon } from "@/hooks/use-coupons";

const sampleCoupon = {
  id: "cpn-1", code: "SAVE20", discount_percent: 20, max_uses: 100, used_count: 0,
  expires_at: "2024-12-31T00:00:00Z", created_at: "2024-01-01T00:00:00Z", organization_id: "org-1",
};

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return ({ children }: { children: ReactNode }) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe("useCoupons", () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it("returns coupons on success", async () => {
    mockSelect.mockReturnValue({ order: mockOrder });
    mockOrder.mockResolvedValue({ data: [sampleCoupon], error: null });
    const { result } = renderHook(() => useCoupons(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });
  it("returns empty array when no data", async () => {
    mockSelect.mockReturnValue({ order: mockOrder });
    mockOrder.mockResolvedValue({ data: null, error: null });
    const { result } = renderHook(() => useCoupons(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});

describe("useCoupon", () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it("returns a single coupon", async () => {
    mockSelect.mockReturnValue({ eq: mockEq }); mockEq.mockReturnValue({ single: mockSingle });
    mockSingle.mockResolvedValue({ data: sampleCoupon, error: null });
    const { result } = renderHook(() => useCoupon("cpn-1"), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.code).toBe("SAVE20");
  });
  it("is disabled when id is undefined", () => {
    const { result } = renderHook(() => useCoupon(undefined), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useCreateCoupon", () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it("creates a coupon successfully", async () => {
    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return {
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: sampleCoupon, error: null })),
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
    const { result } = renderHook(() => useCreateCoupon(), { wrapper: createWrapper() });
    result.current.mutate({ code: "NEW10", discount_percent: 10 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useUpdateCoupon", () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it("updates a coupon successfully", async () => {
    mockFrom.mockReturnValue({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: sampleCoupon, error: null })),
          })),
        })),
      })),
    });
    const { result } = renderHook(() => useUpdateCoupon(), { wrapper: createWrapper() });
    result.current.mutate({ id: "cpn-1", max_uses: 50 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useDeleteCoupon", () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it("deletes a coupon successfully", async () => {
    mockFrom.mockReturnValue({
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    });
    const { result } = renderHook(() => useDeleteCoupon(), { wrapper: createWrapper() });
    result.current.mutate("cpn-1");
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
