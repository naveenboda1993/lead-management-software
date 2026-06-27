import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ActivityTimeline } from "@/components/leads/activity-timeline";
import type { Activity } from "@/types";

vi.mock("lucide-react", () => ({
  Phone: () => <svg data-testid="icon-phone" />,
  Mail: () => <svg data-testid="icon-mail" />,
  Calendar: () => <svg data-testid="icon-calendar" />,
  FileText: () => <svg data-testid="icon-filetext" />,
  MessageSquare: () => <svg data-testid="icon-messagesquare" />,
  UserPlus: () => <svg data-testid="icon-userplus" />,
  RefreshCw: () => <svg data-testid="icon-refreshcw" />,
  CheckCircle: () => <svg data-testid="icon-checkcircle" />,
  XCircle: () => <svg data-testid="icon-xcircle" />,
  Loader2: () => <svg data-testid="icon-loader" />,
}));

vi.mock("@/lib/utils/format", () => ({
  formatRelativeTime: () => "2 hours ago",
}));

vi.mock("@/lib/utils/cn", () => ({
  cn: (...inputs: unknown[]) => inputs.filter(Boolean).join(" "),
}));

vi.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="scroll-area">{children}</div>
  ),
}));

const mockActivity = (overrides: Partial<Activity> = {}): Activity => ({
  id: "act-1",
  lead_id: "lead-1",
  type: "NOTE",
  description: "Called client about property",
  created_at: new Date().toISOString(),
  created_by: "John Doe",
  metadata: { duration: "5min" },
  ...overrides,
});

describe("ActivityTimeline", () => {
  it("shows loading spinner when loading", () => {
    render(<ActivityTimeline activities={[]} loading={true} />);
    expect(screen.getByTestId("icon-loader")).toBeInTheDocument();
  });

  it("shows empty state when no activities", () => {
    render(<ActivityTimeline activities={[]} loading={false} />);
    expect(screen.getByText("No activity recorded yet")).toBeInTheDocument();
  });

  it("renders multiple activities", () => {
    const activities = [
      mockActivity({ id: "act-1", description: "First activity" }),
      mockActivity({ id: "act-2", description: "Second activity" }),
    ];
    render(<ActivityTimeline activities={activities} />);
    expect(screen.getByText("First activity")).toBeInTheDocument();
    expect(screen.getByText("Second activity")).toBeInTheDocument();
  });

  it("renders relative time", () => {
    render(<ActivityTimeline activities={[mockActivity()]} />);
    expect(screen.getByText("2 hours ago")).toBeInTheDocument();
  });

  it("renders created by when present", () => {
    render(<ActivityTimeline activities={[mockActivity({ created_by: "Jane Smith" })]} />);
    expect(screen.getByText("by Jane Smith")).toBeInTheDocument();
  });

  it("does not render 'by' when created_by is absent", () => {
    render(<ActivityTimeline activities={[mockActivity({ created_by: undefined })]} />);
    expect(screen.queryByText(/by/)).not.toBeInTheDocument();
  });

  it("renders metadata when present", () => {
    render(
      <ActivityTimeline
        activities={[mockActivity({ metadata: { duration: "5min", outcome: "positive" } })]}
      />
    );
    expect(screen.getByText("duration:")).toBeInTheDocument();
    expect(screen.getByText("5min")).toBeInTheDocument();
    expect(screen.getByText("outcome:")).toBeInTheDocument();
    expect(screen.getByText("positive")).toBeInTheDocument();
  });

  it("does not render metadata section when empty", () => {
    render(
      <ActivityTimeline
        activities={[mockActivity({ metadata: {} })]}
      />
    );
    expect(screen.queryByText("Duration:")).not.toBeInTheDocument();
  });

  it("renders different activity types with correct icons", () => {
    const activities = [
      mockActivity({ id: "a1", type: "CALL" }),
      mockActivity({ id: "a2", type: "EMAIL" }),
      mockActivity({ id: "a3", type: "MEETING" }),
    ];
    const { container } = render(<ActivityTimeline activities={activities} />);
    expect(container.querySelector('[data-testid="icon-phone"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="icon-mail"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="icon-calendar"]')).toBeInTheDocument();
  });

  it("renders unknown activity type with fallback icon", () => {
    const activities = [mockActivity({ id: "a1", type: "UNKNOWN_TYPE" as Activity["type"] })];
    const { container } = render(<ActivityTimeline activities={activities} />);
    expect(container.querySelector('[data-testid="icon-filetext"]')).toBeInTheDocument();
  });
});
