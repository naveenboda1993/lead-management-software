"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useLead, useUpdateLead, useDeleteLead, useLeadActivities } from "@/hooks/use-leads";
import { useTasks } from "@/hooks/use-tasks";
import { useDocuments } from "@/hooks/use-documents";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/toast";
import { LeadForm } from "@/components/leads/lead-form";
import { ActivityTimeline } from "@/components/leads/activity-timeline";
import {
  LEAD_STATUS_LABELS,
  LEAD_STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  LEAD_SOURCE_LABELS,
} from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { createLeadSchema } from "@/lib/validations/lead";
import { z } from "zod";

type CreateLeadInput = z.infer<typeof createLeadSchema>;

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;

  const { data: lead, isLoading, error } = useLead(leadId);
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();
  const { data: activities, isLoading: activitiesLoading } = useLeadActivities(leadId);
  const { data: tasks, isLoading: tasksLoading } = useTasks(leadId);
  const { data: documents, isLoading: documentsLoading } = useDocuments(leadId);

  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleUpdate = async (data: CreateLeadInput) => {
    try {
      await updateLead.mutateAsync({ id: leadId, ...data });
      toast.success("Lead updated successfully");
      setEditing(false);
    } catch {
      toast.error("Failed to update lead");
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteLead.mutateAsync(leadId);
      toast.success("Lead deleted successfully");
      router.push("/leads");
    } catch {
      toast.error("Failed to delete lead");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-3">
        <p className="text-destructive">Lead not found</p>
        <Button variant="outline" onClick={() => router.push("/leads")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Leads
        </Button>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditing(false)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-bold tracking-tight">
              Edit Lead
            </h1>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <LeadForm
              lead={lead}
              onSubmit={handleUpdate}
              onCancel={() => setEditing(false)}
              loading={updateLead.isPending}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/leads")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">
                {lead.first_name} {lead.last_name}
              </h1>
              <Badge
                className={LEAD_STATUS_COLORS[lead.status]}
                variant="outline"
              >
                {LEAD_STATUS_LABELS[lead.status]}
              </Badge>
              <Badge
                className={PRIORITY_COLORS[lead.priority]}
                variant="outline"
              >
                {PRIORITY_LABELS[lead.priority]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {lead.lead_number} · {lead.company ?? "No company"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Sparkles className="mr-2 h-4 w-4" />
                AI Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  toast.success("Lead scored: 85/100");
                }}
              >
                Score Lead
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  toast.success("Follow-up generated");
                }}
              >
                Generate Follow-up
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  toast.success("AI summary generated");
                }}
              >
                Summarize Lead
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditing(true)}
          >
            <Edit3 className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="activity">Activity Timeline</TabsTrigger>
          <TabsTrigger value="tasks">
            Tasks
            {tasks && tasks.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {tasks.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="documents">
            Documents
            {documents && documents.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {documents.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Email</dt>
                  <dd className="text-sm">{lead.email}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Mobile</dt>
                  <dd className="text-sm">{lead.mobile}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Company</dt>
                  <dd className="text-sm">{lead.company ?? "-"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Job Title</dt>
                  <dd className="text-sm">{lead.job_title ?? "-"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Industry</dt>
                  <dd className="text-sm">{lead.industry ?? "-"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Lead Source</dt>
                  <dd className="text-sm">{LEAD_SOURCE_LABELS[lead.lead_source]}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Deal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Status</dt>
                  <dd>
                    <Badge
                      className={LEAD_STATUS_COLORS[lead.status]}
                      variant="outline"
                    >
                      {LEAD_STATUS_LABELS[lead.status]}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Priority</dt>
                  <dd>
                    <Badge
                      className={PRIORITY_COLORS[lead.priority]}
                      variant="outline"
                    >
                      {PRIORITY_LABELS[lead.priority]}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">
                    Estimated Deal Value
                  </dt>
                  <dd className="text-sm font-medium">
                    {lead.estimated_deal_value
                      ? formatCurrency(lead.estimated_deal_value)
                      : "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">
                    Tags
                  </dt>
                  <dd className="text-sm">
                    {lead.tags && lead.tags.length > 0
                      ? lead.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="mr-1">
                            {tag}
                          </Badge>
                        ))
                      : "-"}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {lead.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{lead.notes}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{formatDate(lead.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span>{formatDate(lead.updated_at)}</span>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardContent className="pt-6">
              <ActivityTimeline
                activities={activities ?? []}
                loading={activitiesLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {tasksLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : !tasks || tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-sm text-muted-foreground">No tasks for this lead</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">{task.title}</span>
                        {task.due_date && (
                          <span className="text-xs text-muted-foreground">
                            Due: {formatDate(task.due_date)}
                          </span>
                        )}
                      </div>
                      <Badge
                        variant={
                          task.status === "COMPLETED"
                            ? "default"
                            : task.status === "CANCELLED"
                              ? "destructive"
                              : "outline"
                        }
                      >
                        {task.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {documentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : !documents || documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">{doc.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {(doc.file_size / 1024).toFixed(1)} KB ·{" "}
                          {formatDate(doc.created_at)}
                        </span>
                      </div>
                      <Badge variant="outline">{doc.file_type}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lead</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>
                {lead.first_name} {lead.last_name}
              </strong>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
