"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Document } from "@/types";
import type { DocumentUploadInput } from "@/lib/validations/document";

const supabase = createClient();

async function fetchDocuments(leadId?: string): Promise<Document[]> {
  let query = supabase
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false });

  if (leadId) {
    query = query.eq("lead_id", leadId);
  }

  const { data } = await query;
  return (data ?? []) as Document[];
}

async function fetchDocument(id: string): Promise<Document | null> {
  const { data } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .single();

  return data as Document | null;
}

async function uploadDocument(input: DocumentUploadInput & { file: File }): Promise<Document> {
  const fileExt = input.file.name.split(".").pop();
  const filePath = `${input.lead_id ?? "general"}/${Date.now()}_${input.file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(filePath, input.file);

  if (uploadError) throw new Error(uploadError.message);

  const { data, error } = await supabase
    .from("documents")
    .insert([
      {
        name: input.name,
        file_path: filePath,
        file_size: input.file.size,
        file_type: input.file.type || fileExt || "unknown",
        lead_id: input.lead_id ?? null,
      },
    ])
    .select()
    .single();

  if (error) {
    await supabase.storage.from("documents").remove([filePath]);
    throw new Error(error.message);
  }

  return data as Document;
}

async function deleteDocument(id: string): Promise<void> {
  const { data: doc } = await supabase
    .from("documents")
    .select("file_path")
    .eq("id", id)
    .single();

  if (doc?.file_path) {
    await supabase.storage.from("documents").remove([doc.file_path]);
  }

  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export function useDocuments(leadId?: string) {
  return useQuery({
    queryKey: ["documents", leadId],
    queryFn: () => fetchDocuments(leadId),
  });
}

export function useDocument(id: string | undefined) {
  return useQuery({
    queryKey: ["document", id],
    queryFn: () => fetchDocument(id!),
    enabled: !!id,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}
