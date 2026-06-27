import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

vi.mock("@/components/ui/skeleton", () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} />
  ),
}));

vi.mock("@/lib/utils/cn", () => ({
  cn: (...inputs: unknown[]) => inputs.filter(Boolean).join(" "),
}));

import {
  LoadingSkeleton,
  TableSkeleton,
  CardSkeleton,
  Spinner,
} from "@/components/layout/loading";

describe("LoadingSkeleton", () => {
  it("renders without crashing", () => {
    const { container } = render(<LoadingSkeleton />);
    expect(
      container.querySelectorAll('[data-testid="skeleton"]').length,
    ).toBeGreaterThan(0);
  });
});

describe("TableSkeleton", () => {
  it("renders with default rows", () => {
    const { container } = render(<TableSkeleton />);
    expect(
      container.querySelectorAll('[data-testid="skeleton"]').length,
    ).toBeGreaterThan(0);
  });

  it("renders with custom rows", () => {
    const { container } = render(<TableSkeleton rows={3} />);
    expect(
      container.querySelectorAll('[data-testid="skeleton"]').length,
    ).toBeGreaterThan(0);
  });
});

describe("CardSkeleton", () => {
  it("renders without crashing", () => {
    render(<CardSkeleton />);
  });
});

describe("Spinner", () => {
  it("renders without crashing", () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("accepts className", () => {
    const { container } = render(<Spinner className="text-red-500" />);
    expect(container.querySelector("svg")?.classList.contains("text-red-500")).toBe(true);
  });
});
