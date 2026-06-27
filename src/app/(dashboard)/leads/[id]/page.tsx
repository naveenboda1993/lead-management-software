"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Sparkles,
  Loader2,
  Plus,
  Home,
  Calendar,
  CheckCircle,
  XCircle,
  Lightbulb,
} from "lucide-react";
import { useLead, useUpdateLead, useDeleteLead, useLeadActivities } from "@/hooks/use-leads";
import { useTasks, useCreateTask } from "@/hooks/use-tasks";
import { useDocuments, useUploadDocument, useDeleteDocument } from "@/hooks/use-documents";
import { usePropertyInterestsByLead, useCreatePropertyInterest, useDeletePropertyInterest } from "@/hooks/use-property-interests";
import { useViewingsByLead, useCreatePropertyViewing, useUpdatePropertyViewing } from "@/hooks/use-property-viewings";
import { useProperties } from "@/hooks/use-properties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  PROPERTY_STATUS_LABELS,
  PROPERTY_STATUS_COLORS,
  PROPERTY_TYPE_LABELS,
} from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { createLeadSchema } from "@/lib/validations/lead";
import { TaskType, TaskStatus } from "@/types";
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
  const { data: propertyInterests, isLoading: propertyInterestsLoading } = usePropertyInterestsByLead(leadId);
  const { data: leadViewings, isLoading: leadViewingsLoading } = useViewingsByLead(leadId);
  const createPropertyInterest = useCreatePropertyInterest();
  const deletePropertyInterest = useDeletePropertyInterest();
  const createPropertyViewing = useCreatePropertyViewing();
  const updatePropertyViewing = useUpdatePropertyViewing();
  const { data: allProperties, isLoading: allPropertiesLoading } = useProperties();
  const createTask = useCreateTask();
  const uploadDocument = useUploadDocument();
  const deleteDocument = useDeleteDocument();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState("");

  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [addPropertyOpen, setAddPropertyOpen] = useState(false);
  const [scheduleViewingOpen, setScheduleViewingOpen] = useState(false);
  const [propertyInterestForm, setPropertyInterestForm] = useState({ property_id: "", interest_level: "MEDIUM", notes: "" });
  const [viewingForm, setViewingForm] = useState({ property_interest_id: "", scheduled_at: "" });
  const [recommendationsOpen, setRecommendationsOpen] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [followUpResult, setFollowUpResult] = useState<{ channel: string; message?: string; tone?: string; timing?: string } | null>(null);
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [scoreLoading, setScoreLoading] = useState(false);
  const [scoreResult, setScoreResult] = useState<{ score: number; conversion_probability: string; recommendation: string; reasoning: string } | null>(null);
  const [scoreOpen, setScoreOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const handleUpdate = async (data: CreateLeadInput) => {
    try {
      const payload = {
        ...data,
        company: data.company || null,
        job_title: data.job_title || null,
        industry: data.industry || null,
        notes: data.notes || null,
        estimated_deal_value: data.estimated_deal_value ?? null,
        tags: data.tags?.length ? data.tags : null,
      };
      await updateLead.mutateAsync({ id: leadId, ...payload });
      toast.success("Lead updated successfully");
      setEditing(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update lead");
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

  const handleAddPropertyInterest = async () => {
    if (!propertyInterestForm.property_id) { toast.error("Select a property"); return; }
    try {
      await createPropertyInterest.mutateAsync({
        lead_id: leadId,
        property_id: propertyInterestForm.property_id,
        interest_level: propertyInterestForm.interest_level as any,
        notes: propertyInterestForm.notes || null,
      });
      toast.success("Property interest added");
      setAddPropertyOpen(false);
      setPropertyInterestForm({ property_id: "", interest_level: "MEDIUM", notes: "" });
    } catch { toast.error("Failed to add interest"); }
  };

  const handleScheduleViewing = async () => {
    if (!viewingForm.property_interest_id || !viewingForm.scheduled_at) {
      toast.error("Fill all fields"); return;
    }
    const interest = propertyInterests?.find(i => i.id === viewingForm.property_interest_id);
    if (!interest) { toast.error("Interest not found"); return; }
    try {
      await createPropertyViewing.mutateAsync({
        property_interest_id: viewingForm.property_interest_id,
        lead_id: leadId,
        property_id: interest.property_id,
        scheduled_at: viewingForm.scheduled_at,
      });
      toast.success("Viewing scheduled");
      setScheduleViewingOpen(false);
      setViewingForm({ property_interest_id: "", scheduled_at: "" });
    } catch { toast.error("Failed to schedule viewing"); }
  };

  const handleCompleteViewing = async (viewingId: string) => {
    try { await updatePropertyViewing.mutateAsync({ id: viewingId, status: "COMPLETED" }); toast.success("Viewing completed"); }
    catch { toast.error("Failed to update viewing"); }
  };

  const handleCancelViewing = async (viewingId: string) => {
    try { await updatePropertyViewing.mutateAsync({ id: viewingId, status: "CANCELLED" }); toast.success("Viewing cancelled"); }
    catch { toast.error("Failed to cancel viewing"); }
  };

  const handleUploadDocument = async () => {
    if (!uploadFile) { toast.error("Select a file"); return; }
    try {
      await uploadDocument.mutateAsync({ file: uploadFile, name: uploadName || uploadFile.name, lead_id: leadId });
      toast.success("Document uploaded");
      setUploadOpen(false);
      setUploadFile(null);
      setUploadName("");
    } catch { toast.error("Failed to upload document"); }
  };

  const interestLevelColor = (level: string) => {
    const colors: Record<string, string> = { LOW: "bg-gray-100 text-gray-700", MEDIUM: "bg-yellow-100 text-yellow-700", HIGH: "bg-orange-100 text-orange-700", VERY_HIGH: "bg-red-100 text-red-700" };
    return colors[level] ?? "bg-gray-100 text-gray-700";
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
            <div className="flex flex-wrap items-center gap-2">
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
                onClick={async () => {
                  setScoreLoading(true);
                  try {
                    const res = await fetch("/api/ai/lead-scoring", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ lead_id: leadId }),
                    });
                    const data = await res.json();
                    if (data.success) {
                      setScoreResult(data.data);
                      setScoreOpen(true);
                    } else {
                      toast.error(data.error || "Failed to score lead");
                    }
                  } catch {
                    toast.error("Failed to score lead");
                  } finally {
                    setScoreLoading(false);
                  }
                }}
              >
                Score Lead
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  setFollowUpLoading(true);
                  try {
                    const res = await fetch("/api/ai/follow-up", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ lead_id: leadId, channel: "generic" }),
                    });
                    const data = await res.json();
                    if (data.success) {
                      setFollowUpResult(data.data);
                      setFollowUpOpen(true);
                      const message = data.data.message ?? data.data.messages?.followUpMessage ?? "";
                      await createTask.mutateAsync({
                        title: `Follow-up: ${lead?.first_name} ${lead?.last_name}`,
                        description: message || "Follow-up generated",
                        lead_id: leadId,
                        task_type: TaskType.FOLLOW_UP,
                        status: TaskStatus.PENDING,
                        due_date: null,
                        assigned_to: null,
                        reminder_at: null,
                      });
                    } else {
                      toast.error(data.error || "Failed to generate follow-up");
                    }
                  } catch {
                    toast.error("Failed to generate follow-up");
                  } finally {
                    setFollowUpLoading(false);
                  }
                }}
              >
                Generate Follow-up
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSummaryOpen(true);
                }}
              >
                Summarize Lead
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  setRecommendationsLoading(true);
                  setRecommendationsOpen(true);
                  try {
                    const res = await fetch("/api/ai/property-recommendation", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        buyer_preferences: {
                          budget: lead.estimated_deal_value,
                          location: lead.company || lead.industry,
                          property_type: null,
                          bedrooms: null,
                          notes: lead.notes,
                          tags: lead.tags,
                        },
                      }),
                    });
                    const data = await res.json();
                    setRecommendations(data.data?.recommendations ?? []);
                  } catch {
                    toast.error("Failed to get recommendations");
                  } finally {
                    setRecommendationsLoading(false);
                  }
                }}
              >
                <Lightbulb className="mr-2 h-4 w-4" />
                Recommend Properties
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
          <TabsTrigger value="properties">
            Properties
            {propertyInterests && propertyInterests.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {propertyInterests.length}
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
                          task.status === "completed"
                            ? "default"
                            : task.status === "cancelled"
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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Documents</CardTitle>
              <Button size="sm" onClick={() => setUploadOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Upload
              </Button>
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
        <TabsContent value="properties" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Interested Properties</h3>
            <Button size="sm" onClick={() => setAddPropertyOpen(true)} disabled={createPropertyInterest.isPending}>
              <Plus className="mr-2 h-4 w-4" /> Add Property
            </Button>
          </div>

          {propertyInterestsLoading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : !propertyInterests || propertyInterests.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">No properties linked to this lead yet.</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {propertyInterests.map((interest) => {
                const views = leadViewings?.filter(v => v.property_interest_id === interest.id) ?? [];
                return (
                  <Card key={interest.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{interest.property?.property_name ?? "Unknown Property"}</p>
                            <p className="text-xs text-muted-foreground">{interest.property?.city}, {interest.property?.state}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={interestLevelColor(interest.interest_level)}>{interest.interest_level}</Badge>
                          <Badge variant="outline">{interest.status}</Badge>
                          <Button variant="ghost" size="sm" onClick={() => deletePropertyInterest.mutate(interest.id)} disabled={deletePropertyInterest.isPending}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      {interest.property && (
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-2">
                          <span>{PROPERTY_TYPE_LABELS[interest.property.property_type]}</span>
                          <span>{formatCurrency(interest.property.price)}</span>
                          <span>{interest.property.bedrooms} bed · {interest.property.bathrooms} bath</span>
                        </div>
                      )}
                      {interest.notes && <p className="text-xs text-muted-foreground mb-2">{interest.notes}</p>}
                      <div className="border-t pt-3 mt-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium">Viewings ({views.length})</span>
                          <Button variant="outline" size="sm" onClick={() => { setViewingForm(p => ({ ...p, property_interest_id: interest.id })); setScheduleViewingOpen(true); }}>
                            <Calendar className="mr-2 h-3 w-3" /> Schedule
                          </Button>
                        </div>
                        {views.length === 0 ? (
                          <p className="text-xs text-muted-foreground">No viewings scheduled</p>
                        ) : (
                          <div className="space-y-2">
                            {views.map((viewing) => (
                              <div key={viewing.id} className="flex items-center justify-between rounded border p-2">
                                <div>
                                  <p className="text-xs">{formatDate(viewing.scheduled_at)}</p>
                                  <Badge variant="outline" className="text-[10px]">{viewing.status}</Badge>
                                </div>
                                <div className="flex gap-1">
                                  {viewing.status === "SCHEDULED" && (
                                    <>
                                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCompleteViewing(viewing.id)} title="Mark completed">
                                        <CheckCircle className="h-3 w-3 text-green-600" />
                                      </Button>
                                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCancelViewing(viewing.id)} title="Cancel">
                                        <XCircle className="h-3 w-3 text-destructive" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={addPropertyOpen} onOpenChange={setAddPropertyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Property</DialogTitle>
            <DialogDescription>Associate a property with this lead.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Property</label>
              <Select value={propertyInterestForm.property_id} onValueChange={(v) => setPropertyInterestForm(p => ({ ...p, property_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select property..." /></SelectTrigger>
                <SelectContent>
                  {allPropertiesLoading ? (
                    <SelectItem value="" disabled>Loading...</SelectItem>
                  ) : (
                    allProperties?.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.property_name} - {p.city}, {formatCurrency(p.price)}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Interest Level</label>
              <Select value={propertyInterestForm.interest_level} onValueChange={(v) => setPropertyInterestForm(p => ({ ...p, interest_level: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="VERY_HIGH">Very High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Notes</label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Optional notes..."
                value={propertyInterestForm.notes}
                onChange={(e) => setPropertyInterestForm(p => ({ ...p, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddPropertyOpen(false)}>Cancel</Button>
            <Button onClick={handleAddPropertyInterest} disabled={createPropertyInterest.isPending}>Link Property</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={recommendationsOpen} onOpenChange={(o) => { if (!o) setRecommendationsOpen(false); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Property Recommendations</DialogTitle>
            <DialogDescription>AI-suggested properties matching this lead&apos;s profile.</DialogDescription>
          </DialogHeader>
          {recommendationsLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : recommendations.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <Lightbulb className="mx-auto h-8 w-8 mb-2 opacity-50" />
              No recommendations found. Try updating the lead&apos;s preferences.
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {recommendations.map((rec: any, i: number) => (
                <Card key={rec.property_id ?? i}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">{rec.title ?? `Property ${i + 1}`}</p>
                        {rec.company && <p className="text-xs text-muted-foreground">{rec.company}</p>}
                        {rec.value && <p className="text-sm font-medium">{formatCurrency(rec.value)}</p>}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{rec.score ?? 0}%</div>
                        <p className="text-xs text-muted-foreground">Match</p>
                      </div>
                    </div>
                    {rec.match_reasons && rec.match_reasons.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {rec.match_reasons.map((r: string, j: number) => (
                          <Badge key={j} variant="secondary" className="text-[10px]">{r}</Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={scheduleViewingOpen} onOpenChange={setScheduleViewingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Viewing</DialogTitle>
            <DialogDescription>Schedule a property visit for this lead.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Interest</label>
              <Select value={viewingForm.property_interest_id} onValueChange={(v) => setViewingForm(p => ({ ...p, property_interest_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select interest..." /></SelectTrigger>
                <SelectContent>
                  {propertyInterests?.map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.property?.property_name ?? "Unknown"} - {i.interest_level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Date & Time</label>
              <input
                type="datetime-local"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={viewingForm.scheduled_at}
                onChange={(e) => setViewingForm(p => ({ ...p, scheduled_at: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleViewingOpen(false)}>Cancel</Button>
            <Button onClick={handleScheduleViewing} disabled={createPropertyViewing.isPending}>Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      <Dialog open={followUpOpen} onOpenChange={setFollowUpOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Generated Follow-up</DialogTitle>
            <DialogDescription>
              AI-generated follow-up message for {lead?.first_name} {lead?.last_name}
            </DialogDescription>
          </DialogHeader>
          {followUpLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : followUpResult ? (
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline">Channel: {followUpResult.channel}</Badge>
                {followUpResult.tone && <Badge variant="outline">Tone: {followUpResult.tone}</Badge>}
                {followUpResult.timing && <Badge variant="outline">Timing: {followUpResult.timing}</Badge>}
              </div>
              <div className="rounded-lg border bg-muted/30 p-4 whitespace-pre-wrap text-sm">
                {followUpResult.message ?? followUpResult.channel}
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button onClick={() => setFollowUpOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={scoreOpen} onOpenChange={setScoreOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Lead Score</DialogTitle>
            <DialogDescription>
              AI-powered lead scoring for {lead?.first_name} {lead?.last_name}
            </DialogDescription>
          </DialogHeader>
          {scoreLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : scoreResult ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold">{scoreResult.score}<span className="text-lg text-muted-foreground">/100</span></div>
                <div className="space-y-1">
                  <Badge>{scoreResult.recommendation}</Badge>
                  <p className="text-sm text-muted-foreground">{scoreResult.conversion_probability}</p>
                </div>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                <p className="font-medium mb-1">Reasoning</p>
                <p className="text-muted-foreground">{scoreResult.reasoning}</p>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button onClick={() => setScoreOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={summaryOpen} onOpenChange={setSummaryOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Lead Summary</DialogTitle>
            <DialogDescription>
              Overview of {lead?.first_name} {lead?.last_name}
            </DialogDescription>
          </DialogHeader>
          {lead ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="font-medium">Name:</span> {lead.first_name} {lead.last_name}</div>
                <div><span className="font-medium">Email:</span> {lead.email || "—"}</div>
                <div><span className="font-medium">Mobile:</span> {lead.mobile || "—"}</div>
                <div><span className="font-medium">Company:</span> {lead.company || "—"}</div>
                <div><span className="font-medium">Status:</span> {lead.status}</div>
                <div><span className="font-medium">Priority:</span> {lead.priority}</div>
                <div><span className="font-medium">Source:</span> {lead.lead_source}</div>
                <div><span className="font-medium">Value:</span> {lead.estimated_deal_value ? formatCurrency(lead.estimated_deal_value) : "—"}</div>
                <div><span className="font-medium">Created:</span> {formatDate(lead.created_at)}</div>
                <div><span className="font-medium">Tags:</span> {lead.tags?.length ? lead.tags.join(", ") : "—"}</div>
              </div>
              {lead.notes && (
                <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                  <p className="font-medium mb-1">Notes</p>
                  <p className="text-muted-foreground">{lead.notes}</p>
                </div>
              )}
            </div>
          ) : null}
          <DialogFooter>
            <Button onClick={() => setSummaryOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>Upload a document for {lead?.first_name} {lead?.last_name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Document Name</label>
              <Input
                placeholder="e.g. Contract, ID Proof..."
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">File</label>
              <Input
                type="file"
                onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setUploadOpen(false); setUploadFile(null); setUploadName(""); }}>
              Cancel
            </Button>
            <Button onClick={handleUploadDocument} disabled={!uploadFile || uploadDocument.isPending}>
              {uploadDocument.isPending ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
