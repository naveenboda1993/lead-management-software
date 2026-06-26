"use client";

import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LeadStatus, LeadSource, LeadPriority } from "@/types";
import {
  LEAD_STATUS_LABELS,
  LEAD_SOURCE_LABELS,
  PRIORITY_LABELS,
} from "@/lib/constants";
import type { LeadFilters } from "@/types";

interface LeadFiltersProps {
  filters: LeadFilters;
  onFiltersChange: (filters: LeadFilters) => void;
}

export function LeadFilters({ filters, onFiltersChange }: LeadFiltersProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.search ?? "");

  const updateFilter = <K extends keyof LeadFilters>(
    key: K,
    value: LeadFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value || undefined });
  };

  const clearFilters = () => {
    setSearchValue("");
    onFiltersChange({});
  };

  const hasFilters =
    filters.search ||
    filters.status?.length ||
    filters.source?.length ||
    filters.priority?.length ||
    filters.assigned_to ||
    filters.date_from ||
    filters.date_to;

  const activeFilterCount =
    (filters.status?.length ?? 0) +
    (filters.source?.length ?? 0) +
    (filters.priority?.length ?? 0) +
    (filters.assigned_to ? 1 : 0) +
    (filters.date_from || filters.date_to ? 1 : 0);

  const toggleStatus = (status: LeadStatus) => {
    const current = filters.status ?? [];
    const next = current.includes(status)
      ? current.filter((s) => s !== status)
      : [...current, status];
    updateFilter("status", next.length ? next : undefined);
  };

  const toggleSource = (source: LeadSource) => {
    const current = filters.source ?? [];
    const next = current.includes(source)
      ? current.filter((s) => s !== source)
      : [...current, source];
    updateFilter("source", next.length ? next : undefined);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            className="pl-8"
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              updateFilter("search", e.target.value || undefined);
            }}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen(!open)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-1 text-muted-foreground"
          >
            <X className="h-3 w-3" />
            Clear
          </Button>
        )}
      </div>

      {open && (
        <div className="rounded-lg border p-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Status
              </label>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => {
                  const isActive = (filters.status ?? []).includes(
                    value as LeadStatus
                  );
                  return (
                    <Badge
                      key={value}
                      variant={isActive ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleStatus(value as LeadStatus)}
                    >
                      {label}
                    </Badge>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Source
              </label>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(LEAD_SOURCE_LABELS).map(([value, label]) => {
                  const isActive = (filters.source ?? []).includes(
                    value as LeadSource
                  );
                  return (
                    <Badge
                      key={value}
                      variant={isActive ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleSource(value as LeadSource)}
                    >
                      {label}
                    </Badge>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Priority
              </label>
              <Select
                value={filters.priority?.[0] ?? "all"}
                onValueChange={(val) =>
                  updateFilter(
                    "priority",
                    val === "all" ? undefined : [val as LeadPriority]
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Date Range
              </label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  placeholder="From"
                  className="h-9 text-xs"
                  value={filters.date_from ?? ""}
                  onChange={(e) =>
                    updateFilter("date_from", e.target.value || undefined)
                  }
                />
                <Input
                  type="date"
                  placeholder="To"
                  className="h-9 text-xs"
                  value={filters.date_to ?? ""}
                  onChange={(e) =>
                    updateFilter("date_to", e.target.value || undefined)
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
