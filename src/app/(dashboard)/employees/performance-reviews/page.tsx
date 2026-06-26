"use client";

import { useState, useMemo, useCallback } from "react";
import { Plus, Loader2, Star } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { usePerformanceReviews, useCreatePerformanceReview, useEmployees } from "@/hooks/use-employees";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils/format";
import type { PerformanceReview } from "@/types";

const ratingOptions = [1, 2, 3, 4, 5];

export default function PerformanceReviewsPage() {
  const { data: reviews, isLoading, error } = usePerformanceReviews();
  const { data: employees } = useEmployees();
  const createReview = useCreatePerformanceReview();

  const [createOpen, setCreateOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null);
  const [formData, setFormData] = useState({
    employee_id: "",
    review_period: "",
    rating: 3,
    feedback: "",
    goals: "",
    achievements: "",
    improvement_areas: "",
  });

  const employeeMap = useMemo(() => {
    const map = new Map<string, string>();
    if (employees) {
      for (const e of employees) {
        map.set(e.id, e.name);
      }
    }
    return map;
  }, [employees]);

  const handleCreate = async () => {
    try {
      await createReview.mutateAsync({
        employee_id: formData.employee_id,
        review_period: formData.review_period,
        rating: formData.rating,
        feedback: formData.feedback,
        goals: formData.goals ? formData.goals.split("\n").filter(Boolean) : [],
        achievements: formData.achievements ? formData.achievements.split("\n").filter(Boolean) : [],
        improvement_areas: formData.improvement_areas ? formData.improvement_areas.split("\n").filter(Boolean) : [],
      } as Partial<PerformanceReview>);
      toast.success("Performance review created");
      setCreateOpen(false);
      setFormData({ employee_id: "", review_period: "", rating: 3, feedback: "", goals: "", achievements: "", improvement_areas: "" });
    } catch {
      toast.error("Failed to create performance review");
    }
  };

  const handleView = useCallback((review: PerformanceReview) => {
    setSelectedReview(review);
    setViewOpen(true);
  }, []);

  const columns = useMemo<ColumnDef<PerformanceReview>[]>(
    () => [
      {
        accessorKey: "employee_id",
        header: "Employee",
        cell: ({ row }) => (
          <span className="font-medium">
            {employeeMap.get(row.original.employee_id) ?? row.original.employee_id.slice(0, 8)}
          </span>
        ),
      },
      {
        accessorKey: "review_period",
        header: "Review Period",
      },
      {
        accessorKey: "rating",
        header: "Rating",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{row.original.rating}/5</span>
          </div>
        ),
      },
      {
        accessorKey: "feedback",
        header: "Feedback",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground truncate max-w-[300px] block">
            {row.original.feedback}
          </span>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => formatDate(row.original.created_at),
      },
    ],
    [employeeMap]
  );

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-destructive">Failed to load performance reviews</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Performance Reviews</h1>
          <p className="text-muted-foreground">Review and manage employee performance evaluations</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Review
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={reviews ?? []}
          searchKey="review_period"
          onRowClick={handleView}
        />
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>New Performance Review</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Employee</Label>
              <Select value={formData.employee_id} onValueChange={(v) => setFormData((p) => ({ ...p, employee_id: v }))}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees?.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Review Period</Label>
                <Input placeholder="e.g. Q1 2026" value={formData.review_period} onChange={(e) => setFormData((p) => ({ ...p, review_period: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Rating</Label>
                <Select value={String(formData.rating)} onValueChange={(v) => setFormData((p) => ({ ...p, rating: Number(v) }))}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ratingOptions.map((r) => (
                      <SelectItem key={r} value={String(r)}>{r} / 5</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Feedback</Label>
              <Textarea placeholder="Overall feedback" value={formData.feedback} onChange={(e) => setFormData((p) => ({ ...p, feedback: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Goals (one per line)</Label>
              <Textarea placeholder="Goal 1\nGoal 2" value={formData.goals} onChange={(e) => setFormData((p) => ({ ...p, goals: e.target.value }))} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Achievements (one per line)</Label>
                <Textarea placeholder="Achievement 1" value={formData.achievements} onChange={(e) => setFormData((p) => ({ ...p, achievements: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Improvement Areas (one per line)</Label>
                <Textarea placeholder="Area 1" value={formData.improvement_areas} onChange={(e) => setFormData((p) => ({ ...p, improvement_areas: e.target.value }))} />
              </div>
            </div>
            <Button onClick={handleCreate} disabled={createReview.isPending}>
              {createReview.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={viewOpen} onOpenChange={(o) => { if (!o) setSelectedReview(null); setViewOpen(o); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Performance Review</DialogTitle></DialogHeader>
          {selectedReview && (
            <div className="grid gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Employee: </span>
                  <span className="font-medium">{employeeMap.get(selectedReview.employee_id) ?? selectedReview.employee_id}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Period: </span>
                  <span className="font-medium">{selectedReview.review_period}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Rating: </span>
                  <span className="font-medium">{selectedReview.rating}/5</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Date: </span>
                  <span className="font-medium">{formatDate(selectedReview.created_at)}</span>
                </div>
              </div>

              {selectedReview.feedback && (
                <div>
                  <Label className="text-xs text-muted-foreground">Feedback</Label>
                  <p className="mt-1 text-sm">{selectedReview.feedback}</p>
                </div>
              )}

              {selectedReview.goals?.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Goals</Label>
                  <ul className="mt-1 list-disc pl-5 text-sm">
                    {selectedReview.goals.map((g, i) => <li key={i}>{g}</li>)}
                  </ul>
                </div>
              )}

              {selectedReview.achievements?.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Achievements</Label>
                  <ul className="mt-1 list-disc pl-5 text-sm">
                    {selectedReview.achievements.map((a, i) => <li key={i}>{a}</li>)}
                  </ul>
                </div>
              )}

              {selectedReview.improvement_areas?.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Improvement Areas</Label>
                  <ul className="mt-1 list-disc pl-5 text-sm">
                    {selectedReview.improvement_areas.map((a, i) => <li key={i}>{a}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
