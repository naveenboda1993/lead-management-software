import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";

const mockUseUser = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/use-user", () => ({
  useUser: mockUseUser,
}));

vi.mock("@/lib/constants", () => ({
  PERMISSIONS: {
    ADMIN: [{ action: "manage", subject: "all" }],
    MANAGER: [
      { action: "read", subject: "leads" },
      { action: "write", subject: "leads" },
    ],
    SALES_EXECUTIVE: [{ action: "read", subject: "leads" }],
  },
}));

import { usePermissions } from "@/hooks/use-permissions";

describe("usePermissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns ADMIN role with all permissions", () => {
    mockUseUser.mockReturnValue({
      user: { role: "ADMIN" },
      loading: false,
    });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.role).toBe("ADMIN");
    expect(result.current.permissions).toEqual([
      { action: "manage", subject: "all" },
    ]);
    expect(result.current.can("manage", "all")).toBe(true);
    expect(result.current.can("read", "leads")).toBe(false);
    expect(result.current.loading).toBe(false);
  });

  it("returns SALES_EXECUTIVE role with limited permissions", () => {
    mockUseUser.mockReturnValue({
      user: { role: "SALES_EXECUTIVE" },
      loading: false,
    });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.role).toBe("SALES_EXECUTIVE");
    expect(result.current.can("read", "leads")).toBe(true);
    expect(result.current.can("write", "leads")).toBe(false);
    expect(result.current.cannot("write", "leads")).toBe(true);
    expect(result.current.cannot("read", "leads")).toBe(false);
  });

  it("canAny returns true if any permission matches", () => {
    mockUseUser.mockReturnValue({
      user: { role: "MANAGER" },
      loading: false,
    });

    const { result } = renderHook(() => usePermissions());

    expect(
      result.current.canAny([
        { action: "read", subject: "leads" },
        { action: "delete", subject: "leads" },
      ])
    ).toBe(true);

    expect(
      result.current.canAny([
        { action: "delete", subject: "leads" },
        { action: "export", subject: "leads" },
      ])
    ).toBe(false);
  });

  it("canAll returns true only if all permissions match", () => {
    mockUseUser.mockReturnValue({
      user: { role: "MANAGER" },
      loading: false,
    });

    const { result } = renderHook(() => usePermissions());

    expect(
      result.current.canAll([
        { action: "read", subject: "leads" },
        { action: "write", subject: "leads" },
      ])
    ).toBe(true);

    expect(
      result.current.canAll([
        { action: "read", subject: "leads" },
        { action: "delete", subject: "leads" },
      ])
    ).toBe(false);
  });

  it("returns null role and empty permissions when no user or loading", () => {
    mockUseUser.mockReturnValue({
      user: null,
      loading: true,
    });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.role).toBeNull();
    expect(result.current.permissions).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.can("read", "leads")).toBe(false);
    expect(result.current.cannot("read", "leads")).toBe(true);
  });
});
