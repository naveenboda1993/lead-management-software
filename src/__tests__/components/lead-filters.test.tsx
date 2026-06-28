import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LeadFilters } from "@/components/leads/lead-filters";
import { LeadStatus, LeadSource } from "@/types";

vi.mock("lucide-react", () => ({
  Search: () => <svg data-testid="icon-search" />,
  Filter: () => <svg data-testid="icon-filter" />,
  X: () => <svg data-testid="icon-x" />,
  ChevronDown: () => <svg data-testid="icon-chevron-down" />,
  ChevronUp: () => <svg data-testid="icon-chevron-up" />,
  Check: () => <svg data-testid="icon-check" />,
}));

vi.mock("@/lib/utils/cn", () => ({
  cn: (...inputs: unknown[]) => inputs.filter(Boolean).join(" "),
}));

const defaultProps = {
  filters: {},
  onFiltersChange: vi.fn(),
};

describe("LeadFilters", () => {
  it("renders search input", () => {
    render(<LeadFilters {...defaultProps} />);
    expect(screen.getByPlaceholderText("Search leads...")).toBeInTheDocument();
  });

  it("renders filters button", () => {
    render(<LeadFilters {...defaultProps} />);
    expect(screen.getByText("Filters")).toBeInTheDocument();
  });

  it("does not show clear button when no filters active", () => {
    render(<LeadFilters {...defaultProps} />);
    expect(screen.queryByText("Clear")).not.toBeInTheDocument();
  });

  it("shows clear button when filters are active", () => {
    render(
      <LeadFilters
        filters={{ status: [LeadStatus.NEW] }}
        onFiltersChange={vi.fn()}
      />
    );
    expect(screen.getByText("Clear")).toBeInTheDocument();
  });

  it("shows filter badge count when filters active", () => {
    render(
      <LeadFilters
        filters={{
          status: [LeadStatus.NEW, LeadStatus.CONTACTED],
          source: [LeadSource.REFERRAL],
        }}
        onFiltersChange={vi.fn()}
      />
    );
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("toggles filter panel open on button click", () => {
    render(<LeadFilters {...defaultProps} />);
    const filterBtn = screen.getByText("Filters");
    fireEvent.click(filterBtn);
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Source")).toBeInTheDocument();
    expect(screen.getByText("Priority")).toBeInTheDocument();
    expect(screen.getByText("Date Range")).toBeInTheDocument();
  });

  it("calls onFiltersChange with cleared filters on clear click", () => {
    const onFiltersChange = vi.fn();
    render(
      <LeadFilters
        filters={{ status: [LeadStatus.NEW] }}
        onFiltersChange={onFiltersChange}
      />
    );
    fireEvent.click(screen.getByText("Clear"));
    expect(onFiltersChange).toHaveBeenCalledWith({});
  });

  it("calls onFiltersChange when search input changes", () => {
    const onFiltersChange = vi.fn();
    render(<LeadFilters filters={{}} onFiltersChange={onFiltersChange} />);
    const searchInput = screen.getByPlaceholderText("Search leads...");
    fireEvent.change(searchInput, { target: { value: "john" } });
    expect(onFiltersChange).toHaveBeenCalledWith({ search: "john" });
  });

  it("toggles status badge on click", () => {
    const onFiltersChange = vi.fn();
    render(<LeadFilters filters={{}} onFiltersChange={onFiltersChange} />);
    fireEvent.click(screen.getByText("Filters"));
    fireEvent.click(screen.getByText("New"));
    expect(onFiltersChange).toHaveBeenCalledWith({ status: [LeadStatus.NEW] });
  });

  it("removes status when badge clicked again", () => {
    const onFiltersChange = vi.fn();
    render(
      <LeadFilters
        filters={{ status: [LeadStatus.NEW] }}
        onFiltersChange={onFiltersChange}
      />
    );
    fireEvent.click(screen.getByText("Filters"));
    fireEvent.click(screen.getByText("New"));
    expect(onFiltersChange).toHaveBeenCalledWith({ status: undefined });
  });

  it("calls onFiltersChange with source on source badge click", () => {
    const onFiltersChange = vi.fn();
    render(<LeadFilters filters={{}} onFiltersChange={onFiltersChange} />);
    fireEvent.click(screen.getByText("Filters"));
    fireEvent.click(screen.getByText("Referral"));
    expect(onFiltersChange).toHaveBeenCalledWith({ source: [LeadSource.REFERRAL] });
  });

  it("shows date range inputs when open", () => {
    render(<LeadFilters {...defaultProps} />);
    fireEvent.click(screen.getByText("Filters"));
    expect(screen.getByPlaceholderText("From")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("To")).toBeInTheDocument();
  });
});
