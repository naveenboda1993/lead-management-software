import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";

vi.mock("@/lib/utils/cn", () => ({
  cn: (...inputs: unknown[]) => inputs.filter(Boolean).join(" "),
}));

interface TestData {
  id: string;
  name: string;
  email: string;
}

const columns: ColumnDef<TestData>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
];

const data: TestData[] = [
  { id: "1", name: "John Doe", email: "john@example.com" },
  { id: "2", name: "Jane Smith", email: "jane@example.com" },
  { id: "3", name: "Bob Johnson", email: "bob@example.com" },
];

describe("DataTable", () => {
  it("renders table headers", () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("renders data rows", () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("Bob Johnson")).toBeInTheDocument();
  });

  it("shows 'No results' when data is empty", () => {
    render(<DataTable columns={columns} data={[]} />);
    expect(screen.getByText("No results.")).toBeInTheDocument();
  });

  it("shows search input when searchKey is provided", () => {
    render(<DataTable columns={columns} data={data} searchKey="name" />);
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
  });

  it("does not show search input when no searchKey", () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.queryByPlaceholderText("Search...")).not.toBeInTheDocument();
  });

  it("filters data when search is typed", () => {
    render(<DataTable columns={columns} data={data} searchKey="name" />);
    const searchInput = screen.getByPlaceholderText("Search...");
    fireEvent.change(searchInput, { target: { value: "Jane" } });
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
  });

  it("shows pagination when data exceeds pageSize", () => {
    render(<DataTable columns={columns} data={data} pageSize={2} />);
    expect(screen.getByText("Previous")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();
  });

  it("disables previous button on first page", () => {
    render(<DataTable columns={columns} data={data} pageSize={2} />);
    expect(screen.getByText("Previous")).toBeDisabled();
    expect(screen.getByText("Next")).not.toBeDisabled();
  });

  it("enables previous button after navigating forward", () => {
    render(<DataTable columns={columns} data={data} pageSize={2} />);
    fireEvent.click(screen.getByText("Next"));
    expect(screen.getByText("Previous")).not.toBeDisabled();
  });

  it("shows row selection count", () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByText(/0 of 3 row/)).toBeInTheDocument();
  });

  it("calls onRowClick when row is clicked", () => {
    const onRowClick = vi.fn();
    render(<DataTable columns={columns} data={data} onRowClick={onRowClick} />);
    fireEvent.click(screen.getByText("John Doe"));
    expect(onRowClick).toHaveBeenCalledWith(data[0]);
  });
});
