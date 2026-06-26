"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import {
  Plus,
  Loader2,
  FileText,
  File,
  Image,
  FileSpreadsheet,
  Table2,
  FileDown,
  Trash2,
  ExternalLink,
  LayoutGrid,
  List,
} from "lucide-react";
import { useDocuments, useUploadDocument, useDeleteDocument } from "@/hooks/use-documents";
import { useLeads } from "@/hooks/use-leads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils/cn";
import { formatDate, formatRelativeTime } from "@/lib/utils/format";
import type { Document } from "@/types";
import { createClient } from "@/lib/supabase/client";

function getFileIcon(fileType: string) {
  const type = fileType.toLowerCase();
  if (type.includes("pdf")) return FileText;
  if (type.includes("image") || type.includes("png") || type.includes("jpg") || type.includes("jpeg")) return Image;
  if (type.includes("spreadsheet") || type.includes("xls") || type.includes("xlsx") || type.includes("csv")) return Table2;
  if (type.includes("sheet") || type.includes("numbers")) return FileSpreadsheet;
  return File;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsPage() {
  const { data: documents, isLoading, error } = useDocuments();
  const uploadDocument = useUploadDocument();
  const deleteDocument = useDeleteDocument();
  const { data: leads } = useLeads();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [leadFilter, setLeadFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadName, setUploadName] = useState("");
  const [uploadLeadId, setUploadLeadId] = useState<string>("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null);

  const filteredDocuments = useMemo(() => {
    if (!documents) return [];
    return documents.filter((doc) => {
      if (leadFilter !== "ALL" && doc.lead_id !== leadFilter) return false;
      if (typeFilter !== "ALL" && !doc.file_type.toLowerCase().includes(typeFilter.toLowerCase())) return false;
      return true;
    });
  }, [documents, leadFilter, typeFilter]);

  const leadOptions = useMemo(
    () =>
      leads?.map((l) => ({
        id: l.id,
        label: `${l.first_name} ${l.last_name}${l.company ? ` (${l.company})` : ""}`,
      })) ?? [],
    [leads]
  );

  const getDownloadUrl = useCallback(async (doc: Document) => {
    const supabase = createClient();
    const { data } = await supabase.storage
      .from("documents")
      .createSignedUrl(doc.file_path, 60 * 60);
    return data?.signedUrl;
  }, []);

  const handleDownload = useCallback(
    async (doc: Document) => {
      try {
        const url = await getDownloadUrl(doc);
        if (url) {
          const a = document.createElement("a");
          a.href = url;
          a.download = doc.name;
          a.click();
        } else {
          toast.error("Failed to generate download link");
        }
      } catch {
        toast.error("Failed to download document");
      }
    },
    [getDownloadUrl]
  );

  const handlePreview = useCallback(
    async (doc: Document) => {
      const url = await getDownloadUrl(doc);
      if (url) {
        window.open(url, "_blank");
      } else {
        toast.error("Failed to generate preview link");
      }
    },
    [getDownloadUrl]
  );

  const handleUpload = async () => {
    if (!uploadFile || !uploadName.trim()) {
      toast.error("Please provide a name and select a file");
      return;
    }
    try {
      await uploadDocument.mutateAsync({
        name: uploadName.trim(),
        file: uploadFile,
        lead_id: uploadLeadId || null,
      });
      toast.success("Document uploaded successfully");
      setUploadOpen(false);
      setUploadName("");
      setUploadFile(null);
      setUploadLeadId("");
    } catch {
      toast.error("Failed to upload document");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDocument.mutateAsync(deleteTarget.id);
      toast.success("Document deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete document");
    }
  };

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-destructive">Failed to load documents</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">
            Upload and manage documents for your leads
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode("grid")}
            className={cn(viewMode === "grid" && "bg-accent")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode("list")}
            className={cn(viewMode === "list" && "bg-accent")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button onClick={() => setUploadOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Upload
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Filter by Lead</Label>
          <Select value={leadFilter} onValueChange={setLeadFilter}>
            <SelectTrigger className="h-8 w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Leads</SelectItem>
              {leadOptions.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">File Type</Label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-8 w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="spreadsheet">Spreadsheet</SelectItem>
              <SelectItem value="document">Document</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">No documents found</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setUploadOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Upload your first document
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredDocuments.map((doc) => {
            const Icon = getFileIcon(doc.file_type);
            const lead = leads?.find((l) => l.id === doc.lead_id);
            return (
              <Card key={doc.id} className="group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <Icon className="h-8 w-8 text-primary" />
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handlePreview(doc)}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleDownload(doc)}
                      >
                        <FileDown className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => setDeleteTarget(doc)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-sm truncate mt-2">
                    {doc.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>{formatFileSize(doc.file_size)}</span>
                    <Badge variant="outline" className="text-[10px] px-1">
                      {doc.file_type}
                    </Badge>
                  </div>
                  <p>Uploaded {formatRelativeTime(doc.created_at)}</p>
                  {lead && (
                    <p className="truncate">
                      Lead: {lead.first_name} {lead.last_name}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredDocuments.map((doc) => {
            const Icon = getFileIcon(doc.file_type);
            const lead = leads?.find((l) => l.id === doc.lead_id);
            return (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className="h-5 w-5 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(doc.file_size)} &middot;{" "}
                      {formatDate(doc.created_at)}
                      {lead && (
                        <> &middot; {lead.first_name} {lead.last_name}</>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Badge variant="outline" className="text-[10px]">
                    {doc.file_type}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handlePreview(doc)}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleDownload(doc)}
                  >
                    <FileDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => setDeleteTarget(doc)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="docName">
                Document Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="docName"
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
                placeholder="e.g., Sales Proposal Q1"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="docFile">
                File <span className="text-destructive">*</span>
              </Label>
              <Input
                id="docFile"
                type="file"
                ref={fileInputRef}
                onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="docLead">Associated Lead</Label>
              <Select value={uploadLeadId} onValueChange={setUploadLeadId}>
                <SelectTrigger>
                  <SelectValue placeholder="No lead (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">No lead</SelectItem>
                  {leadOptions.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUploadOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploadDocument.isPending}
            >
              {uploadDocument.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget?.name}</strong>? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteDocument.isPending}
            >
              {deleteDocument.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
