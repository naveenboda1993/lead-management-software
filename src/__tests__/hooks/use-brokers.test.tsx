import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

const { mockSelect, mockEq, mockOrder, mockSingle, mockFrom } = vi.hoisted(() => {
  const mockSelect = vi.fn(); const mockEq = vi.fn(); const mockOrder = vi.fn(); const mockSingle = vi.fn();
  const mockFrom = vi.fn(() => ({ select: mockSelect, order: mockOrder, eq: mockEq, single: mockSingle }));
  return { mockSelect, mockEq, mockOrder, mockSingle, mockFrom };
});

vi.mock("@/lib/supabase/client", () => {
  const mockAuthGetUser = vi.fn(() => Promise.resolve({ data: { user: { id: "user-1" } }, error: null }));
  return { createClient: () => ({ from: mockFrom, auth: { getUser: mockAuthGetUser } }) };
});

vi.mock("@/lib/utils/cn", () => ({ cn: (...inputs: unknown[]) => inputs.filter(Boolean).join(" ") }));

import { useBrokers, useBroker, useCreateBroker, useUpdateBroker, useDeleteBroker } from "@/hooks/use-brokers";

const sampleBroker = {
  id: "brk-1", name: "ABC Realty", email: "abc@realty.com", phone: "1234567890",
  company: "ABC Corp", properties_sold: 5, total_commission_earned: 50000,
  created_at: "2024-01-01T00:00:00Z", organization_id: "org-1",
};

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return ({ children }: { children: ReactNode }) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe("useBrokers", () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it("returns brokers on success", async () => {
    mockSelect.mockReturnValue({ order: mockOrder }); mockOrder.mockResolvedValue({ data: [sampleBroker], error: null });
    const { result } = renderHook(() => useBrokers(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });
  it("returns empty array when no data", async () => {
    mockSelect.mockReturnValue({ order: mockOrder }); mockOrder.mockResolvedValue({ data: null, error: null });
    const { result } = renderHook(() => useBrokers(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});

describe("useBroker", () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it("returns a single broker", async () => {
    mockSelect.mockReturnValue({ eq: mockEq }); mockEq.mockReturnValue({ single: mockSingle });
    mockSingle.mockResolvedValue({ data: sampleBroker, error: null });
    const { result } = renderHook(() => useBroker("brk-1"), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.name).toBe("ABC Realty");
  });
  it("is disabled when id is undefined", () => {
    const { result } = renderHook(() => useBroker(undefined), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useCreateBroker", () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it("creates a broker successfully", async () => {
    mockFrom
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: { organization_id: "org-1" }, error: null })),
          })),
        })),
      })
      .mockReturnValueOnce({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: sampleBroker, error: null })),
          })),
        })),
      });
    const { result } = renderHook(() => useCreateBroker(), { wrapper: createWrapper() });
    result.current.mutate({ name: "New Broker", email: "new@broker.com" });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useUpdateBroker", () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it("updates a broker successfully", async () => {
    mockFrom.mockReturnValue({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: sampleBroker, error: null })),
          })),
        })),
      })),
    });
    const { result } = renderHook(() => useUpdateBroker(), { wrapper: createWrapper() });
    result.current.mutate({ id: "brk-1", properties_sold: 10 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useDeleteBroker", () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it("deletes a broker successfully", async () => {
    mockFrom.mockReturnValue({
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    });
    const { result } = renderHook(() => useDeleteBroker(), { wrapper: createWrapper() });
    result.current.mutate("brk-1");
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
