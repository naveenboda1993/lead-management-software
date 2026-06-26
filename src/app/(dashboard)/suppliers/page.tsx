"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { useSuppliers, useCreateSupplier } from "@/hooks/use-suppliers";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils/format";
import type { Supplier } from "@/types";

export default function SuppliersPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<{ search?: string }>({});
  const { data: suppliers, isLoading, error } = useSuppliers(filters);
  const createSupplier = useCreateSupplier();
  const [createOpen, setCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", company: "",
    address: "", payment_terms: "NET30", lead_time_days: 7,
  });

  const handleCreate = async () => {
    try {
      await createSupplier.mutateAsync(formData);
      toast.success("Supplier created");
      setCreateOpen(false);
    } catch {
      toast.error("Failed to create supplier");
    }
  };

  const handleRowClick = useCallback(
    (supplier: Supplier) => {
      router.push(`/suppliers/${supplier.id}`);
    },
    [router]
  );

  const columns = useMemo<ColumnDef<Supplier>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        accessorKey: "company",
        header: "Company",
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
        accessorKey: "payment_terms",
        header: "Payment Terms",
      },
      {
        accessorKey: "lead_time_days",
        header: "Lead Time (days)",
      },
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => formatDate(row.original.created_at),
      },
    ],
    []
  );

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-destructive">Failed to load suppliers</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-muted-foreground">Manage your suppliers</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Supplier
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={suppliers ?? []}
          searchKey="name"
          onRowClick={handleRowClick}
        />
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Supplier</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <Input placeholder="Name" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Email" value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} />
              <Input placeholder="Phone" value={formData.phone} onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))} />
            </div>
            <Input placeholder="Company" value={formData.company} onChange={(e) => setFormData((p) => ({ ...p, company: e.target.value }))} />
            <Input placeholder="Address" value={formData.address} onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Payment Terms" value={formData.payment_terms} onChange={(e) => setFormData((p) => ({ ...p, payment_terms: e.target.value }))} />
              <Input type="number" placeholder="Lead Time (days)" value={formData.lead_time_days} onChange={(e) => setFormData((p) => ({ ...p, lead_time_days: Number(e.target.value) }))} />
            </div>
            <Button onClick={handleCreate} disabled={createSupplier.isPending}>
              {createSupplier.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
