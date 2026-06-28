import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("lucide-react", () => ({
  Loader2: () => <div data-testid="loader" />,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, type, disabled }: any) => (
    <button data-testid="btn" onClick={onClick} type={type} disabled={disabled}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/input", () => ({
  Input: (props: any) => <input data-testid="input" {...props} />,
}));

vi.mock("@/components/ui/label", () => ({
  Label: ({ children, ...props }: any) => (
    <label data-testid="label" {...props}>
      {children}
    </label>
  ),
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({ children, onValueChange, value }: any) => (
    <select
      data-testid="select"
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
    >
      {children}
    </select>
  ),
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ value, children }: any) => <option value={value}>{children}</option>,
  SelectTrigger: ({ children }: any) => <>{children}</>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
}));

vi.mock("@/lib/utils/cn", () => ({
  cn: (...inputs: unknown[]) => inputs.filter(Boolean).join(" "),
}));

vi.mock("@/lib/constants", () => ({
  TASK_TYPE_LABELS: {
    follow_up: "Follow Up",
    call: "Call",
    meeting: "Meeting",
    reminder: "Reminder",
    note: "Note",
  },
  TASK_STATUS_LABELS: {
    pending: "Pending",
    completed: "Completed",
    cancelled: "Cancelled",
  },
}));

import { TaskForm } from "@/components/tasks/task-form";

const mockOnSubmit = vi.fn();
const mockOnCancel = vi.fn();

describe("TaskForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form fields", () => {
    render(
      <TaskForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        leads={[{ id: "lead-1", label: "John Doe" }]}
        users={[{ id: "user-1", label: "Jane" }]}
      />,
    );
    expect(screen.getByText("Title")).toBeInTheDocument();
  });

  it("calls onCancel when cancel button clicked", () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    const buttons = screen.getAllByTestId("btn");
    const cancelBtn = buttons.find((b) => b.textContent === "Cancel");
    if (cancelBtn) fireEvent.click(cancelBtn);
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it("renders loading state", () => {
    render(
      <TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} loading />,
    );
    expect(screen.getByText("Create Task")).toBeInTheDocument();
    expect(screen.getByTestId("loader")).toBeInTheDocument();
    const buttons = screen.getAllByTestId("btn");
    const submitBtn = buttons.find((b) => b.getAttribute("type") === "submit");
    expect(submitBtn).toBeDisabled();
  });

  it("renders with task data for editing", () => {
    const task = {
      id: "task-1",
      title: "Test Task",
      task_type: "follow_up" as const,
    };
    render(
      <TaskForm
        task={task as any}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />,
    );
    expect(screen.getByText("Update Task")).toBeInTheDocument();
  });
});
