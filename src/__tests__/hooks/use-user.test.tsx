import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { Role } from "@/types";

const { mockSelect, mockEq, mockSingle, mockFrom } = vi.hoisted(() => {
  const mockSelect = vi.fn();
  const mockEq = vi.fn();
  const mockSingle = vi.fn();
  const mockFrom = vi.fn(() => ({
    select: mockSelect,
    eq: mockEq,
    single: mockSingle,
  }));
  return { mockSelect, mockEq, mockSingle, mockFrom };
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

const mockUseAuth = vi.fn();
vi.mock("@/providers/auth-provider", () => ({
  useAuth: (...args: unknown[]) => mockUseAuth(...args),
}));

import { useUser } from "@/hooks/use-user";

const authUser = {
  id: "user-1",
  email: "test@test.com",
  user_metadata: { name: "Test User", role: "SALES_EXECUTIVE" },
  created_at: "2024-01-01T00:00:00Z",
  last_sign_in_at: "2024-01-15T00:00:00Z",
};

const profileData = {
  full_name: "Test User",
  role: "SALES_EXECUTIVE",
  avatar_url: null,
  phone: null,
  department: null,
  designation: null,
  employee_id: null,
  date_of_joining: null,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

describe("useUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns user from profile when auth user exists and profile found", async () => {
    mockUseAuth.mockReturnValue({ user: authUser, loading: false });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ single: mockSingle });
    mockSingle.mockResolvedValue({ data: profileData, error: null });

    const { result } = renderHook(() => useUser());
    await waitFor(() => expect(result.current.user).toBeTruthy());

    expect(result.current.user).toEqual({
      id: "user-1",
      email: "test@test.com",
      name: "Test User",
      role: Role.SALES_EXECUTIVE,
      avatar_url: null,
      phone: null,
      department: null,
      designation: null,
      employee_id: null,
      date_of_joining: null,
      mfa_enabled: false,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    });
  });

  it("returns fallback user when profile fetch fails", async () => {
    mockUseAuth.mockReturnValue({ user: authUser, loading: false });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ single: mockSingle });
    mockSingle.mockResolvedValue({ data: null, error: new Error("Not found") });

    const { result } = renderHook(() => useUser());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.user).toEqual({
      id: "user-1",
      email: "test@test.com",
      name: "Test User",
      role: Role.SALES_EXECUTIVE,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-15T00:00:00Z",
    });
  });

  it("returns null user when no auth user", async () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });

    const { result } = renderHook(() => useUser());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.user).toBeNull();
    expect(result.current.authUser).toBeNull();
  });

  it("returns loading initially when auth is loading", () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true });

    const { result } = renderHook(() => useUser());

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
  });
});
