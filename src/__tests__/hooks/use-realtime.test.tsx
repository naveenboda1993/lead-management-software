import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

const { mockChannel, mockOn, mockSubscribe, mockRemoveChannel } = vi.hoisted(() => {
  const mockSubscribe = vi.fn();
  const mockOn = vi.fn();
  const channelObj = { on: mockOn, subscribe: mockSubscribe };
  mockOn.mockReturnValue(channelObj);
  mockSubscribe.mockReturnValue(channelObj);
  const mockChannel = vi.fn(() => channelObj);
  const mockRemoveChannel = vi.fn();
  return { mockChannel, mockOn, mockSubscribe, mockRemoveChannel };
});

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    channel: mockChannel,
    removeChannel: mockRemoveChannel,
  }),
}));

vi.mock("@/lib/utils/cn", () => ({
  cn: (...inputs: unknown[]) => inputs.filter(Boolean).join(" "),
}));

import {
  useRealtimeLeads,
  useRealtimeTasks,
  useRealtimeNotifications,
  useRealtimeDashboard,
} from "@/hooks/use-realtime";

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe("useRealtimeLeads", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("subscribes to leads table", () => {
    renderHook(() => useRealtimeLeads(), { wrapper: createWrapper() });

    expect(mockChannel).toHaveBeenCalledWith("leads-changes");
    expect(mockOn).toHaveBeenCalledWith("postgres_changes", {
      event: "*",
      schema: "public",
      table: "leads",
      filter: undefined,
    }, expect.any(Function));
    expect(mockSubscribe).toHaveBeenCalled();
  });
});

describe("useRealtimeTasks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("subscribes to tasks table", () => {
    renderHook(() => useRealtimeTasks(), { wrapper: createWrapper() });

    expect(mockChannel).toHaveBeenCalledWith("tasks-changes");
    expect(mockOn).toHaveBeenCalledWith("postgres_changes", {
      event: "*",
      schema: "public",
      table: "tasks",
      filter: undefined,
    }, expect.any(Function));
    expect(mockSubscribe).toHaveBeenCalled();
  });
});

describe("useRealtimeNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("subscribes to notifications table", () => {
    renderHook(() => useRealtimeNotifications(), { wrapper: createWrapper() });

    expect(mockChannel).toHaveBeenCalledWith("notifications-changes");
    expect(mockOn).toHaveBeenCalledWith("postgres_changes", {
      event: "*",
      schema: "public",
      table: "notifications",
      filter: undefined,
    }, expect.any(Function));
    expect(mockSubscribe).toHaveBeenCalled();
  });
});

describe("useRealtimeDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("subscribes to both leads and tasks", () => {
    renderHook(() => useRealtimeDashboard(), { wrapper: createWrapper() });

    expect(mockChannel).toHaveBeenCalledTimes(2);
    expect(mockChannel).toHaveBeenCalledWith("leads-changes");
    expect(mockChannel).toHaveBeenCalledWith("tasks-changes");
    expect(mockOn).toHaveBeenCalledTimes(2);
    expect(mockSubscribe).toHaveBeenCalledTimes(2);
  });
});

describe("cleanup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("unsubscribes on unmount", () => {
    const { unmount } = renderHook(() => useRealtimeLeads(), { wrapper: createWrapper() });
    const channelObj = mockChannel.mock.results[0]?.value;
    unmount();

    expect(mockRemoveChannel).toHaveBeenCalledWith(channelObj);
  });
});
