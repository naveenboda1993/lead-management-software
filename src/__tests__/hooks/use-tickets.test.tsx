import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

const { mockSelect, mockEq, mockOrder, mockSingle, mockOr, mockFrom } = vi.hoisted(() => {
  const mockSelect = vi.fn();
  const mockEq = vi.fn();
  const mockOrder = vi.fn();
  const mockSingle = vi.fn();
  const mockOr = vi.fn();
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

import {
  useTickets,
  useTicket,
  useCreateTicket,
  useUpdateTicket,
  useDeleteTicket,
  useTicketMessages,
  useCreateTicketMessage,
} from "@/hooks/use-tickets";

const sampleTicket = {
  id: "tkt-1",
  title: "Login issue",
  description: "Cannot log in",
  status: "OPEN",
  priority: "HIGH",
  channel: "EMAIL",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  organization_id: "org-1",
};

const sampleMessage = {
  id: "msg-1",
  ticket_id: "tkt-1",
  message: "We are looking into it",
  sender_id: "user-1",
  sender_type: "AGENT",
  attachments: [],
  created_at: "2024-01-01T00:00:00Z",
};

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe("useTickets", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns tickets with search filter", async () => {
    mockSelect.mockReturnValue({ order: mockOrder });
    mockOrder.mockReturnValue({ or: mockOr });
    mockOr.mockResolvedValue({ data: [sampleTicket], error: null });

    const { result } = renderHook(() => useTickets({ search: "login" }), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].title).toBe("Login issue");
  });
});

describe("useTicket", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns a single ticket", async () => {
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ single: mockSingle });
    mockSingle.mockResolvedValue({ data: sampleTicket, error: null });

    const { result } = renderHook(() => useTicket("tkt-1"), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.title).toBe("Login issue");
  });
});

describe("useTicketMessages", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns ticket messages on success", async () => {
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ order: mockOrder });
    mockOrder.mockResolvedValue({ data: [sampleMessage], error: null });

    const { result } = renderHook(() => useTicketMessages("tkt-1"), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].message).toBe("We are looking into it");
  });
});

describe("useCreateTicket", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("creates a ticket successfully", async () => {
    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return {
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: sampleTicket, error: null })),
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

    const { result } = renderHook(() => useCreateTicket(), { wrapper: createWrapper() });
    result.current.mutate({ title: "New issue", description: "Help" });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useUpdateTicket", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("updates a ticket successfully", async () => {
    mockFrom.mockReturnValue({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: sampleTicket, error: null })),
          })),
        })),
      })),
    });

    const { result } = renderHook(() => useUpdateTicket(), { wrapper: createWrapper() });
    result.current.mutate({ id: "tkt-1", status: "CLOSED" });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useDeleteTicket", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("deletes a ticket successfully", async () => {
    mockFrom.mockReturnValue({
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    });

    const { result } = renderHook(() => useDeleteTicket(), { wrapper: createWrapper() });
    result.current.mutate("tkt-1");
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useCreateTicketMessage", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("creates a message successfully", async () => {
    mockFrom.mockReturnValue({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: sampleMessage, error: null })),
        })),
      })),
    });

    const { result } = renderHook(() => useCreateTicketMessage(), { wrapper: createWrapper() });
    result.current.mutate({ ticket_id: "tkt-1", message: "Looking into it", sender_id: "user-1", sender_type: "AGENT" });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
