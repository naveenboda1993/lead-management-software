"use client";

import { useState, useMemo, useCallback } from "react";
import { Plus, Loader2, Pencil, Trash2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { useBrokers, useCreateBroker, useUpdateBroker, useDeleteBroker } from "@/hooks/use-brokers";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { Broker } from "@/types";

interface BrokerFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  commission_rate: number;
}

const defaultFormData: BrokerFormData = {
  name: "", email: "", phone: "", company: "", commission_rate: 0,
};

export default function BrokersPage() {
  const { data: brokers, isLoading, error } = useBrokers();
  const createBroker = useCreateBroker();
  const updateBroker = useUpdateBroker();
  const deleteBroker = useDeleteBroker();

  const [createOpen, setCreateOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editBroker, setEditBroker] = useState<Broker | null>(null);
  const [formData, setFormData] = useState<BrokerFormData>(defaultFormData);

  const handleCreate = async () => {
    try {
      await createBroker.mutateAsync(formData);
      toast.success("Broker created");
      setCreateOpen(false);
      setFormData(defaultFormData);
    } catch {
      toast.error("Failed to create broker");
    }
  };

  const handleEdit = useCallback((broker: Broker) => {
    setEditBroker(broker);
    setFormData({
      name: broker.name,
      email: broker.email,
      phone: broker.phone,
      company: broker.company ?? "",
      commission_rate: broker.commission_rate,
    });
    setEditDialogOpen(true);
  }, []);

  const handleUpdate = async () => {
    if (!editBroker) return;
    try {
      await updateBroker.mutateAsync({ id: editBroker.id, ...formData });
      toast.success("Broker updated");
      setEditDialogOpen(false);
      setEditBroker(null);
    } catch {
      toast.error("Failed to update broker");
    }
  };

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteBroker.mutateAsync(id);
      toast.success("Broker deleted");
    } catch {
      toast.error("Failed to delete broker");
    }
  }, [deleteBroker]);

  const columns = useMemo<ColumnDef<Broker>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "phone",
        header: "Phone",
      },
      {
        accessorKey: "company",
        header: "Company",
        cell: ({ row }) => row.original.company ?? "-",
      },
      {
        accessorKey: "commission_rate",
        header: "Commission Rate",
        cell: ({ row }) => `${row.original.commission_rate}%`,
      },
      {
        accessorKey: "total_commission_earned",
        header: "Total Earned",
        cell: ({ row }) => formatCurrency(row.original.total_commission_earned),
      },
      {
        accessorKey: "properties_sold",
        header: "Properties Sold",
      },
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => formatDate(row.original.created_at),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEdit(row.original)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleDelete(row.original.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [handleEdit, handleDelete]
  );

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-destructive">Failed to load brokers</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Brokers</h1>
          <p className="text-muted-foreground">Manage real estate brokers and commission rates</p>
        </div>
        <Button onClick={() => { setFormData(defaultFormData); setCreateOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Broker
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable columns={columns} data={brokers ?? []} searchKey="name" />
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Broker</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Name</Label>
              <Input placeholder="Broker name" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Email</Label>
                <Input placeholder="Email" value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Phone</Label>
                <Input placeholder="Phone" value={formData.phone} onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Company</Label>
              <Input placeholder="Company" value={formData.company} onChange={(e) => setFormData((p) => ({ ...p, company: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Commission Rate (%)</Label>
              <Input type="number" placeholder="Commission rate" value={formData.commission_rate} onChange={(e) => setFormData((p) => ({ ...p, commission_rate: Number(e.target.value) }))} />
            </div>
            <Button onClick={handleCreate} disabled={createBroker.isPending}>
              {createBroker.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={(o) => { if (!o) setEditBroker(null); setEditDialogOpen(o); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Broker</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Name</Label>
              <Input placeholder="Broker name" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Email</Label>
                <Input placeholder="Email" value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Phone</Label>
                <Input placeholder="Phone" value={formData.phone} onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Company</Label>
              <Input placeholder="Company" value={formData.company} onChange={(e) => setFormData((p) => ({ ...p, company: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Commission Rate (%)</Label>
              <Input type="number" placeholder="Commission rate" value={formData.commission_rate} onChange={(e) => setFormData((p) => ({ ...p, commission_rate: Number(e.target.value) }))} />
            </div>
            <Button onClick={handleUpdate} disabled={updateBroker.isPending}>
              {updateBroker.isPending ? "Updating..." : "Update"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
