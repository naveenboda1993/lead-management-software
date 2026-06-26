"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useCreateCampaign } from "@/hooks/use-campaigns";
import type { CampaignType, CampaignStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { toast } from "@/components/ui/toast";
import { CAMPAIGN_TYPE_LABELS, CAMPAIGN_STATUS_LABELS } from "@/lib/constants";

export default function NewCampaignPage() {
  const router = useRouter();
  const createCampaign = useCreateCampaign();
  const [formData, setFormData] = useState({
    name: "",
    type: "EMAIL",
    status: "DRAFT",
    subject: "",
    content: "",
    recipient_list: [] as string[],
    scheduled_at: "",
  });
  const [recipientInput, setRecipientInput] = useState("");

  const addRecipient = () => {
    if (recipientInput.trim()) {
      setFormData((p) => ({ ...p, recipient_list: [...p.recipient_list, recipientInput.trim()] }));
      setRecipientInput("");
    }
  };

  const removeRecipient = (idx: number) => {
    setFormData((p) => ({ ...p, recipient_list: p.recipient_list.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async () => {
    try {
      await createCampaign.mutateAsync({
        ...formData,
        scheduled_at: formData.scheduled_at || null,
      } as any);
      toast.success("Campaign created");
      router.push("/campaigns");
    } catch {
      toast.error("Failed to create campaign");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/campaigns")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">Create Campaign</h1>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Campaign Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Campaign Name"
            value={formData.name}
            onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              value={formData.type}
              onValueChange={(v) => setFormData((p) => ({ ...p, type: v }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(CAMPAIGN_TYPE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={formData.status}
              onValueChange={(v) => setFormData((p) => ({ ...p, status: v }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(CAMPAIGN_STATUS_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {formData.type !== "SMS" && (
            <Input
              placeholder="Subject"
              value={formData.subject}
              onChange={(e) => setFormData((p) => ({ ...p, subject: e.target.value }))}
            />
          )}
          <textarea
            className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Campaign content / message body"
            value={formData.content}
            onChange={(e) => setFormData((p) => ({ ...p, content: e.target.value }))}
          />
          <div>
            <label className="text-sm font-medium mb-1 block">Recipients</label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Add recipient (email/phone)"
                value={recipientInput}
                onChange={(e) => setRecipientInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addRecipient()}
              />
              <Button variant="outline" onClick={addRecipient}>Add</Button>
            </div>
            {formData.recipient_list.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.recipient_list.map((r, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm cursor-pointer hover:bg-destructive/10"
                    onClick={() => removeRecipient(i)}
                  >
                    {r} &times;
                  </span>
                ))}
              </div>
            )}
          </div>
          <Input
            type="datetime-local"
            value={formData.scheduled_at}
            onChange={(e) => setFormData((p) => ({ ...p, scheduled_at: e.target.value }))}
          />
          <div className="flex gap-3">
            <Button onClick={handleSubmit} disabled={createCampaign.isPending}>
              {createCampaign.isPending ? "Creating..." : "Create Campaign"}
            </Button>
            <Button variant="outline" onClick={() => router.push("/campaigns")}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
