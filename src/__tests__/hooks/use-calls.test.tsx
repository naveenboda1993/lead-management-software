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
  useCallLogs,
  useCallLog,
  useCreateCallLog,
  useVirtualNumbers,
  useCreateVirtualNumber,
} from "@/hooks/use-calls";

const sampleCallLog = {
  id: "cl-1",
  from_number: "+1234567890",
  to_number: "+0987654321",
  direction: "INBOUND",
  status: "COMPLETED",
  duration: 120,
  created_at: "2024-01-01T00:00:00Z",
  organization_id: "org-1",
};

const sampleVirtualNumber = {
  id: "vn-1",
  number: "+15551234567",
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

describe("useCallLogs", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns call logs on success", async () => {
    mockSelect.mockReturnValue({ order: mockOrder });
    mockOrder.mockResolvedValue({ data: [sampleCallLog], error: null });
    const { result } = renderHook(() => useCallLogs(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });

  it("returns empty array when no data", async () => {
    mockSelect.mockReturnValue({ order: mockOrder });
    mockOrder.mockResolvedValue({ data: null, error: null });
    const { result } = renderHook(() => useCallLogs(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});

describe("useCallLog", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns a single call log", async () => {
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ single: mockSingle });
    mockSingle.mockResolvedValue({ data: sampleCallLog, error: null });
    const { result } = renderHook(() => useCallLog("cl-1"), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.from_number).toBe("+1234567890");
  });

  it("is disabled when id is undefined", () => {
    const { result } = renderHook(() => useCallLog(undefined), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useVirtualNumbers", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns virtual numbers on success", async () => {
    mockSelect.mockReturnValue({ order: mockOrder });
    mockOrder.mockResolvedValue({ data: [sampleVirtualNumber], error: null });
    const { result } = renderHook(() => useVirtualNumbers(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });

  it("returns empty array when no data", async () => {
    mockSelect.mockReturnValue({ order: mockOrder });
    mockOrder.mockResolvedValue({ data: null, error: null });
    const { result } = renderHook(() => useVirtualNumbers(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});

describe("useCreateCallLog", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("creates a call log successfully", async () => {
    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return {
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: sampleCallLog, error: null })),
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

    const { result } = renderHook(() => useCreateCallLog(), { wrapper: createWrapper() });
    result.current.mutate({ from_number: "+1234567890" });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useCreateVirtualNumber", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("creates a virtual number successfully", async () => {
    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return {
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: sampleVirtualNumber, error: null })),
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

    const { result } = renderHook(() => useCreateVirtualNumber(), { wrapper: createWrapper() });
    result.current.mutate({ number: "+15551234567" });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
