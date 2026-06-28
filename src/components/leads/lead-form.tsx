"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createLeadSchema,
} from "@/lib/validations/lead";
import { z } from "zod";
import { LeadStatus, LeadSource, LeadPriority } from "@/types";
import {
  LEAD_STATUS_LABELS,
  LEAD_SOURCE_LABELS,
  PRIORITY_LABELS,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/hooks/use-user";
import type { Lead } from "@/types";

type LeadFormValues = z.infer<typeof createLeadSchema>;

interface LeadFormProps {
  lead?: Lead | null;
  onSubmit: (data: LeadFormValues) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function LeadForm({ lead, onSubmit, onCancel, loading }: LeadFormProps) {
  const { user } = useUser();
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(lead?.tags ?? []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LeadFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createLeadSchema) as any,
    defaultValues: lead
      ? {
          first_name: lead.first_name,
          last_name: lead.last_name,
          email: lead.email,
          mobile: lead.mobile,
          company: lead.company ?? "",
          job_title: lead.job_title ?? "",
          industry: lead.industry ?? "",
          lead_source: lead.lead_source,
          status: lead.status,
          priority: lead.priority,
          estimated_deal_value: lead.estimated_deal_value ?? undefined,
          notes: lead.notes ?? "",
          tags: lead.tags ?? [],
          assigned_to: lead.assigned_to ?? user?.id ?? null,
        }
      : {
          first_name: "",
          last_name: "",
          email: "",
          mobile: "",
          company: "",
          job_title: "",
          industry: "",
          lead_source: LeadSource.MANUAL_ENTRY,
          status: LeadStatus.NEW,
          priority: LeadPriority.MEDIUM,
          estimated_deal_value: undefined,
          notes: "",
          tags: [],
          assigned_to: user?.id ?? null,
        },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="first_name">
            First Name <span className="text-destructive">*</span>
          </Label>
          <Input id="first_name" {...register("first_name")} />
          {errors.first_name && (
            <p className="text-xs text-destructive">{errors.first_name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">
            Last Name <span className="text-destructive">*</span>
          </Label>
          <Input id="last_name" {...register("last_name")} />
          {errors.last_name && (
            <p className="text-xs text-destructive">{errors.last_name.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="mobile">
            Mobile <span className="text-destructive">*</span>
          </Label>
          <Input id="mobile" {...register("mobile")} />
          {errors.mobile && (
            <p className="text-xs text-destructive">{errors.mobile.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input id="company" {...register("company")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="job_title">Job Title</Label>
          <Input id="job_title" {...register("job_title")} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <Input id="industry" {...register("industry")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lead_source">Lead Source</Label>
          <Select
            defaultValue={lead?.lead_source ?? LeadSource.MANUAL_ENTRY}
            onValueChange={(val) =>
              setValue("lead_source", val as LeadSource)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(LEAD_SOURCE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            defaultValue={lead?.status ?? LeadStatus.NEW}
            onValueChange={(val) => setValue("status", val as LeadStatus)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select
            defaultValue={lead?.priority ?? LeadPriority.MEDIUM}
            onValueChange={(val) => setValue("priority", val as LeadPriority)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="estimated_deal_value">Est. Deal Value ($)</Label>
          <Input
            id="estimated_deal_value"
            type="number"
            step="0.01"
            {...register("estimated_deal_value", { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          rows={4}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          {...register("notes")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tags.map((tag, i) => (
            <Badge key={i} variant="secondary" className="gap-1 pr-1">
              {tag}
              <button
                type="button"
                className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5 leading-none"
                onClick={() => {
                  const updated = tags.filter((_, j) => j !== i);
                  setTags(updated);
                  setValue("tags", updated);
                }}
              >
                &times;
              </button>
            </Badge>
          ))}
        </div>
        <Input
          id="tags"
          placeholder="Type a tag and press Enter"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const trimmed = tagInput.trim();
              if (trimmed && !tags.includes(trimmed)) {
                const updated = [...tags, trimmed];
                setTags(updated);
                setValue("tags", updated);
              }
              setTagInput("");
            }
          }}
        />
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : lead ? "Update Lead" : "Create Lead"}
        </Button>
      </div>
    </form>
  );
}
