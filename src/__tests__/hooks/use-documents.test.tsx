import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

const { mockSelect, mockEq, mockOrder, mockSingle, mockFrom, mockStorageUpload, mockStorageRemove } = vi.hoisted(() => {
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
  const mockStorageUpload = vi.fn();
  const mockStorageRemove = vi.fn();
  return { mockSelect, mockEq, mockOrder, mockSingle, mockFrom, mockStorageUpload, mockStorageRemove };
});

vi.mock("@/lib/supabase/client", () => {
  const mockAuthGetUser = vi.fn(() =>
    Promise.resolve({ data: { user: { id: "user-1" } }, error: null })
  );
  return {
    createClient: () => ({
      from: mockFrom,
      auth: { getUser: mockAuthGetUser },
      storage: {
        from: vi.fn(() => ({
          upload: mockStorageUpload,
          remove: mockStorageRemove,
        })),
      },
    }),
  };
});

vi.mock("@/lib/utils/cn", () => ({
  cn: (...inputs: unknown[]) => inputs.filter(Boolean).join(" "),
}));

import {
  useDocuments,
  useDocument,
  useUploadDocument,
  useDeleteDocument,
} from "@/hooks/use-documents";

const sampleDocument = {
  id: "doc-1",
  name: "Contract.pdf",
  file_path: "lead-1/1234567890_Contract.pdf",
  file_size: 1024,
  file_type: "application/pdf",
  lead_id: "lead-1",
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

describe("useDocuments", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns documents on success", async () => {
    mockSelect.mockReturnValue({ order: mockOrder });
    mockOrder.mockResolvedValue({ data: [sampleDocument], error: null });
    const { result } = renderHook(() => useDocuments(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].name).toBe("Contract.pdf");
  });

  it("returns empty array when no data", async () => {
    mockSelect.mockReturnValue({ order: mockOrder });
    mockOrder.mockResolvedValue({ data: null, error: null });
    const { result } = renderHook(() => useDocuments(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("filters by leadId", async () => {
    mockSelect.mockReturnValue({ order: mockOrder });
    mockOrder.mockReturnValue({ eq: mockEq });
    mockEq.mockResolvedValue({ data: [sampleDocument], error: null });
    const { result } = renderHook(() => useDocuments("lead-1"), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(mockEq).toHaveBeenCalledWith("lead_id", "lead-1");
  });
});

describe("useDocument", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns a single document", async () => {
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ single: mockSingle });
    mockSingle.mockResolvedValue({ data: sampleDocument, error: null });
    const { result } = renderHook(() => useDocument("doc-1"), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.name).toBe("Contract.pdf");
  });

  it("is disabled when id is undefined", () => {
    const { result } = renderHook(() => useDocument(undefined), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useUploadDocument", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("uploads successfully", async () => {
    mockStorageUpload.mockResolvedValue({ error: null });

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
            single: vi.fn(() => Promise.resolve({ data: sampleDocument, error: null })),
          })),
        })),
      });

    const { result } = renderHook(() => useUploadDocument(), { wrapper: createWrapper() });
    result.current.mutate({
      name: "Contract.pdf",
      lead_id: "lead-1",
      file: new File(["test"], "Contract.pdf", { type: "application/pdf" }),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useDeleteDocument", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("deletes successfully", async () => {
    mockStorageRemove.mockResolvedValue({ error: null });

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() =>
                Promise.resolve({
                  data: { file_path: "lead-1/1234567890_Contract.pdf" },
                  error: null,
                })
              ),
            })),
          })),
        };
      }
      return {
        delete: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null })),
        })),
      };
    });

    const { result } = renderHook(() => useDeleteDocument(), { wrapper: createWrapper() });
    result.current.mutate("doc-1");
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
