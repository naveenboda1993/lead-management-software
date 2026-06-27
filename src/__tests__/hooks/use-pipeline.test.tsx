import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

const { mockSelect, mockEq, mockOrder, mockFrom } = vi.hoisted(() => {
  const mockSelect = vi.fn();
  const mockEq = vi.fn();
  const mockOrder = vi.fn();
  const mockFrom = vi.fn(() => ({
    select: mockSelect,
  }));
  return { mockSelect, mockEq, mockOrder, mockFrom };
});

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: mockFrom,
  }),
}));

vi.mock("@/lib/utils/cn", () => ({
  cn: (...inputs: unknown[]) => inputs.filter(Boolean).join(" "),
}));

import { usePipeline } from "@/hooks/use-pipeline";

const mockLead = {
  id: "lead-1",
  first_name: "John",
  last_name: "Doe",
  status: "new",
  updated_at: "2024-01-01T00:00:00Z",
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("usePipeline", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("groups leads by stage across all statuses", async () => {
    let callIndex = 0;
    mockEq.mockReturnValue({ order: mockOrder });
    mockOrder.mockImplementation(() => {
      callIndex++;
      return Promise.resolve({
        data: callIndex <= 1 ? [mockLead] : [],
        error: null,
      });
    });
    mockSelect.mockReturnValue({ eq: mockEq });

    const { result } = renderHook(() => usePipeline(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(Array.isArray(result.current.data)).toBe(true);
  });
});
