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
  useEmployees,
  useEmployee,
  useAttendance,
  useCreateAttendance,
  useUpdateAttendance,
  useLeaves,
  useCreateLeave,
  useUpdateLeave,
} from "@/hooks/use-employees";

const sampleEmployee = { id: "emp-1", full_name: "Jane Doe", email: "jane@example.com", role: "SALES_EXECUTIVE", created_at: "2024-01-01T00:00:00Z" };
const sampleAttendance = { id: "att-1", employee_id: "emp-1", date: "2024-01-01", status: "PRESENT", created_at: "2024-01-01T00:00:00Z", organization_id: "org-1" };
const sampleLeave = { id: "lv-1", employee_id: "emp-1", status: "PENDING", created_at: "2024-01-01T00:00:00Z", organization_id: "org-1" };

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe("useEmployees", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns employees on success", async () => {
    mockSelect.mockReturnValue({ order: mockOrder });
    mockOrder.mockResolvedValue({ data: [sampleEmployee], error: null });
    const { result } = renderHook(() => useEmployees(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].full_name).toBe("Jane Doe");
  });

  it("returns empty array when no data", async () => {
    mockSelect.mockReturnValue({ order: mockOrder });
    mockOrder.mockResolvedValue({ data: null, error: null });
    const { result } = renderHook(() => useEmployees(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});

describe("useEmployee", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns a single employee", async () => {
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ single: mockSingle });
    mockSingle.mockResolvedValue({ data: sampleEmployee, error: null });
    const { result } = renderHook(() => useEmployee("emp-1"), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.full_name).toBe("Jane Doe");
  });

  it("is disabled when id is undefined", () => {
    const { result } = renderHook(() => useEmployee(undefined), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useAttendance", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns attendance records on success", async () => {
    mockSelect.mockReturnValue({ order: mockOrder });
    mockOrder.mockResolvedValue({ data: [sampleAttendance], error: null });
    const { result } = renderHook(() => useAttendance(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });
});

describe("useCreateAttendance", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("creates attendance successfully", async () => {
    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return {
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: sampleAttendance, error: null })),
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

    const { result } = renderHook(() => useCreateAttendance(), { wrapper: createWrapper() });
    result.current.mutate({ employee_id: "emp-1", date: "2024-01-01", status: "PRESENT" });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useUpdateAttendance", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("updates attendance successfully", async () => {
    mockFrom.mockReturnValue({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: sampleAttendance, error: null })),
          })),
        })),
      })),
    });

    const { result } = renderHook(() => useUpdateAttendance(), { wrapper: createWrapper() });
    result.current.mutate({ id: "att-1", status: "ABSENT" });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useLeaves", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockImplementation(() => ({ select: mockSelect, order: mockOrder, eq: mockEq, single: mockSingle }));
  });

  it("returns leaves on success", async () => {
    mockSelect.mockReturnValue({ order: mockOrder });
    mockOrder.mockResolvedValue({ data: [sampleLeave], error: null });
    const { result } = renderHook(() => useLeaves(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });
});

describe("useCreateLeave", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReset();
  });

  it("creates a leave successfully", async () => {
    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return {
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: sampleLeave, error: null })),
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

    const { result } = renderHook(() => useCreateLeave(), { wrapper: createWrapper() });
    result.current.mutate({ employee_id: "emp-1", status: "PENDING" });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useUpdateLeave", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReset();
  });

  it("updates a leave successfully", async () => {
    mockFrom.mockReturnValue({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: sampleLeave, error: null })),
          })),
        })),
      })),
    });

    const { result } = renderHook(() => useUpdateLeave(), { wrapper: createWrapper() });
    result.current.mutate({ id: "lv-1", status: "APPROVED" });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
