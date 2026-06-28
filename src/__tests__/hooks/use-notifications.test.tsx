import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

const { mockSelect, mockEq, mockOrder, mockSingle, mockUpdate, mockDelete, mockLimit, mockFrom } = vi.hoisted(() => {
  const mockSelect = vi.fn();
  const mockEq = vi.fn();
  const mockOrder = vi.fn();
  const mockSingle = vi.fn();
  const mockUpdate = vi.fn();
  const mockDelete = vi.fn();
  const mockLimit = vi.fn();
  const mockFrom = vi.fn(() => ({
    select: mockSelect,
    order: mockOrder,
    eq: mockEq,
    single: mockSingle,
    update: mockUpdate,
    delete: mockDelete,
    limit: mockLimit,
  }));
  return { mockSelect, mockEq, mockOrder, mockSingle, mockUpdate, mockDelete, mockLimit, mockFrom };
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

import { useNotifications } from "@/hooks/use-notifications";

const sampleNotifications = [
  { id: "notif-1", title: "New lead", message: "A new lead was assigned", read: false, created_at: "2024-01-01T00:00:00Z" },
  { id: "notif-2", title: "Task completed", message: "Task was completed", read: true, created_at: "2024-01-02T00:00:00Z" },
  { id: "notif-3", title: "Reminder", message: "Follow up with client", read: false, created_at: "2024-01-03T00:00:00Z" },
];

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe("useNotifications", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns notifications and computed values", async () => {
    mockSelect.mockReturnValue({ order: mockOrder });
    mockOrder.mockReturnValue({ limit: mockLimit });
    mockLimit.mockResolvedValue({ data: sampleNotifications, error: null });

    const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.notifications).toHaveLength(3);
    expect(result.current.unreadCount).toBe(2);
    expect(result.current.recentUnread).toHaveLength(2);
  });

  it("markAsRead calls mutation successfully", async () => {
    mockSelect.mockReturnValue({ order: mockOrder });
    mockOrder.mockReturnValue({ limit: mockLimit });
    mockLimit.mockResolvedValue({ data: sampleNotifications, error: null });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockEq.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    result.current.markAsRead("notif-1");

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({ read: true });
      expect(mockEq).toHaveBeenCalledWith("id", "notif-1");
    });
  });

  it("markAllAsRead calls mutation successfully", async () => {
    mockSelect.mockReturnValue({ order: mockOrder });
    mockOrder.mockReturnValue({ limit: mockLimit });
    mockLimit.mockResolvedValue({ data: sampleNotifications, error: null });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockEq.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    result.current.markAllAsRead();

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({ read: true });
      expect(mockEq).toHaveBeenCalledWith("read", false);
    });
  });

  it("deleteNotification calls mutation successfully", async () => {
    mockSelect.mockReturnValue({ order: mockOrder });
    mockOrder.mockReturnValue({ limit: mockLimit });
    mockLimit.mockResolvedValue({ data: sampleNotifications, error: null });
    mockDelete.mockReturnValue({ eq: mockEq });
    mockEq.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    result.current.deleteNotification("notif-1");

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith("id", "notif-1");
    });
  });
});
