import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

const { mockSelect, mockEq, mockOrder, mockSingle, mockOr, mockFrom } = vi.hoisted(() => {
  const mockSelect = vi.fn();
  const mockEq = vi.fn();
  const mockOrder = vi.fn();
  const mockOr = vi.fn();
  const mockSingle = vi.fn();
  const mockFrom = vi.fn(() => ({
    select: mockSelect,
    order: mockOrder,
    eq: mockEq,
    single: mockSingle,
    or: mockOr,
  }));
  return { mockSelect, mockEq, mockOrder, mockSingle, mockOr, mockFrom };
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

import { useTasks, useTask, useCreateTask, useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";

const mockTask = {
  id: "task-1",
  title: "Follow up with client",
  description: "Call John about property",
  task_type: "follow_up",
  status: "pending",
  lead_id: "lead-1",
  assigned_to: "user-2",
  due_date: "2024-02-01T00:00:00Z",
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

describe("useTasks", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns tasks on success", async () => {
    mockSelect.mockReturnValue({ order: mockOrder });
    mockOrder.mockResolvedValue({ data: [mockTask], error: null });
    const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].title).toBe("Follow up with client");
  });

  it("returns empty array when no data", async () => {
    mockSelect.mockReturnValue({ order: mockOrder });
    mockOrder.mockResolvedValue({ data: null, error: null });
    const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});

describe("useTask", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns a single task", async () => {
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ single: mockSingle });
    mockSingle.mockResolvedValue({ data: mockTask, error: null });
    const { result } = renderHook(() => useTask("task-1"), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.title).toBe("Follow up with client");
  });

  it("is disabled when id is undefined", () => {
    const { result } = renderHook(() => useTask(undefined), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useCreateTask", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("creates a task successfully", async () => {
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
            single: vi.fn(() => Promise.resolve({ data: mockTask, error: null })),
          })),
        })),
      });

    const { result } = renderHook(() => useCreateTask(), { wrapper: createWrapper() });
    result.current.mutate({ title: "New task", task_type: "follow_up" });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useUpdateTask", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("updates a task successfully", async () => {
    mockFrom.mockReturnValue({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: mockTask, error: null })),
          })),
        })),
      })),
    });

    const { result } = renderHook(() => useUpdateTask(), { wrapper: createWrapper() });
    result.current.mutate({ id: "task-1", status: "completed" });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useDeleteTask", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("deletes a task successfully", async () => {
    mockFrom.mockReturnValue({
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    });

    const { result } = renderHook(() => useDeleteTask(), { wrapper: createWrapper() });
    result.current.mutate("task-1");
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
