"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useVirtualNumbers, useCreateVirtualNumber } from "@/hooks/use-calls";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";

export default function VirtualNumbersPage() {
  const { data: numbers, isLoading } = useVirtualNumbers();
  const createVirtualNumber = useCreateVirtualNumber();
  const [createOpen, setCreateOpen] = useState(false);
  const [formData, setFormData] = useState<{ number: string; provider: string }>({ number: "", provider: "EXOTEL" });

  const handleCreate = async () => {
    try {
      await createVirtualNumber.mutateAsync(formData as any);
      toast.success("Virtual number added");
      setCreateOpen(false);
      setFormData({ number: "", provider: "EXOTEL" });
    } catch {
      toast.error("Failed to add number");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Virtual Numbers</h1>
          <p className="text-muted-foreground">Manage your IVR virtual phone numbers</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Number
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !numbers || numbers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No virtual numbers configured</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {numbers.map((num) => (
            <Card key={num.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{num.number}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{num.provider}</span>
                  <Badge variant={num.is_active ? "default" : "secondary"}>
                    {num.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Virtual Number</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <Input
              placeholder="Phone number"
              value={formData.number}
              onChange={(e) => setFormData((p) => ({ ...p, number: e.target.value }))}
            />
            <Select
              value={formData.provider}
              onValueChange={(v) => setFormData((p) => ({ ...p, provider: v }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="EXOTEL">Exotel</SelectItem>
                <SelectItem value="TWILIO">Twilio</SelectItem>
                <SelectItem value="KNOWLARITY">Knowlarity</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleCreate} disabled={createVirtualNumber.isPending}>
              {createVirtualNumber.isPending ? "Adding..." : "Add Number"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
