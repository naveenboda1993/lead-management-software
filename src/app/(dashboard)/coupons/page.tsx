"use client";

import { useState, useMemo, useCallback } from "react";
import { Plus, Loader2, Pencil, Trash2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { useCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon } from "@/hooks/use-coupons";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";
import type { Coupon } from "@/types";

interface CouponFormData {
  code: string;
  description: string;
  discount_type: "PERCENTAGE" | "FIXED";
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: string;
  usage_limit: number;
  is_active: boolean;
  valid_from: string;
  valid_until: string;
}

const defaultFormData: CouponFormData = {
  code: "",
  description: "",
  discount_type: "PERCENTAGE",
  discount_value: 0,
  min_order_amount: 0,
  max_discount_amount: "",
  usage_limit: 100,
  is_active: true,
  valid_from: "",
  valid_until: "",
};

export default function CouponsPage() {
  const { data: coupons, isLoading, error } = useCoupons();
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const [createOpen, setCreateOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editCoupon, setEditCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState<CouponFormData>(defaultFormData);

  const handleCreate = async () => {
    try {
      await createCoupon.mutateAsync({
        ...formData,
        max_discount_amount: formData.max_discount_amount ? Number(formData.max_discount_amount) : null,
        valid_from: new Date(formData.valid_from).toISOString(),
        valid_until: new Date(formData.valid_until).toISOString(),
      } as Partial<Coupon>);
      toast.success("Coupon created");
      setCreateOpen(false);
      setFormData(defaultFormData);
    } catch {
      toast.error("Failed to create coupon");
    }
  };

  const handleEdit = useCallback((coupon: Coupon) => {
    setEditCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description ?? "",
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_order_amount: coupon.min_order_amount,
      max_discount_amount: coupon.max_discount_amount?.toString() ?? "",
      usage_limit: coupon.usage_limit,
      is_active: coupon.is_active,
      valid_from: coupon.valid_from.slice(0, 10),
      valid_until: coupon.valid_until.slice(0, 10),
    });
    setEditDialogOpen(true);
  }, []);

  const handleUpdate = async () => {
    if (!editCoupon) return;
    try {
      await updateCoupon.mutateAsync({
        id: editCoupon.id,
        ...formData,
        max_discount_amount: formData.max_discount_amount ? Number(formData.max_discount_amount) : null,
        valid_from: new Date(formData.valid_from).toISOString(),
        valid_until: new Date(formData.valid_until).toISOString(),
      } as Partial<Coupon> & { id: string });
      toast.success("Coupon updated");
      setEditDialogOpen(false);
      setEditCoupon(null);
    } catch {
      toast.error("Failed to update coupon");
    }
  };

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteCoupon.mutateAsync(id);
      toast.success("Coupon deleted");
    } catch {
      toast.error("Failed to delete coupon");
    }
  }, [deleteCoupon]);

  const handleToggleActive = useCallback(async (coupon: Coupon) => {
    try {
      await updateCoupon.mutateAsync({ id: coupon.id, is_active: !coupon.is_active });
      toast.success(`Coupon ${coupon.is_active ? "deactivated" : "activated"}`);
    } catch {
      toast.error("Failed to update coupon");
    }
  }, [updateCoupon]);

  const columns = useMemo<ColumnDef<Coupon>[]>(
    () => [
      {
        accessorKey: "code",
        header: "Code",
        cell: ({ row }) => (
          <code className="rounded bg-muted px-2 py-0.5 text-sm font-mono font-semibold">
            {row.original.code}
          </code>
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => row.original.description ?? "-",
      },
      {
        accessorKey: "discount_type",
        header: "Type",
        cell: ({ row }) => (
          <Badge variant="outline">
            {row.original.discount_type === "PERCENTAGE" ? "% Off" : "$ Off"}
          </Badge>
        ),
      },
      {
        accessorKey: "discount_value",
        header: "Value",
        cell: ({ row }) =>
          row.original.discount_type === "PERCENTAGE"
            ? `${row.original.discount_value}%`
            : formatCurrency(row.original.discount_value),
      },
      {
        accessorKey: "usage_limit",
        header: "Usage",
        cell: ({ row }) => `${row.original.used_count} / ${row.original.usage_limit}`,
      },
      {
        accessorKey: "is_active",
        header: "Active",
        cell: ({ row }) => (
          <Switch
            checked={row.original.is_active}
            onCheckedChange={() => handleToggleActive(row.original)}
          />
        ),
      },
      {
        accessorKey: "valid_from",
        header: "Valid From",
        cell: ({ row }) => formatDate(row.original.valid_from),
      },
      {
        accessorKey: "valid_until",
        header: "Valid Until",
        cell: ({ row }) => formatDate(row.original.valid_until),
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
    [handleEdit, handleDelete, handleToggleActive]
  );

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-destructive">Failed to load coupons</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Coupons</h1>
          <p className="text-muted-foreground">Manage discount coupons for orders</p>
        </div>
        <Button onClick={() => { setFormData(defaultFormData); setCreateOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Coupon
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable columns={columns} data={coupons ?? []} searchKey="code" />
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Coupon</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Code</Label>
                <Input placeholder="e.g. SUMMER20" value={formData.code} onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value.toUpperCase() }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Discount Type</Label>
                <Select value={formData.discount_type} onValueChange={(v) => setFormData((p) => ({ ...p, discount_type: v as "PERCENTAGE" | "FIXED" }))}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                    <SelectItem value="FIXED">Fixed Amount ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Input placeholder="Description" value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Discount Value</Label>
                <Input type="number" placeholder="e.g. 20" value={formData.discount_value} onChange={(e) => setFormData((p) => ({ ...p, discount_value: Number(e.target.value) }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Max Discount Amount</Label>
                <Input type="number" placeholder="Leave empty for no max" value={formData.max_discount_amount} onChange={(e) => setFormData((p) => ({ ...p, max_discount_amount: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Min Order Amount</Label>
                <Input type="number" placeholder="0" value={formData.min_order_amount} onChange={(e) => setFormData((p) => ({ ...p, min_order_amount: Number(e.target.value) }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Usage Limit</Label>
                <Input type="number" placeholder="100" value={formData.usage_limit} onChange={(e) => setFormData((p) => ({ ...p, usage_limit: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Valid From</Label>
                <Input type="date" value={formData.valid_from} onChange={(e) => setFormData((p) => ({ ...p, valid_from: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Valid Until</Label>
                <Input type="date" value={formData.valid_until} onChange={(e) => setFormData((p) => ({ ...p, valid_until: e.target.value }))} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formData.is_active} onCheckedChange={(v) => setFormData((p) => ({ ...p, is_active: v }))} />
              <Label className="text-xs">Active</Label>
            </div>
            <Button onClick={handleCreate} disabled={createCoupon.isPending}>
              {createCoupon.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={(o) => { if (!o) setEditCoupon(null); setEditDialogOpen(o); }}>
          <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Coupon</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Code</Label>
                <Input placeholder="e.g. SUMMER20" value={formData.code} onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value.toUpperCase() }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Discount Type</Label>
                <Select value={formData.discount_type} onValueChange={(v) => setFormData((p) => ({ ...p, discount_type: v as "PERCENTAGE" | "FIXED" }))}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                    <SelectItem value="FIXED">Fixed Amount ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Input placeholder="Description" value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Discount Value</Label>
                <Input type="number" placeholder="e.g. 20" value={formData.discount_value} onChange={(e) => setFormData((p) => ({ ...p, discount_value: Number(e.target.value) }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Max Discount Amount</Label>
                <Input type="number" placeholder="Leave empty for no max" value={formData.max_discount_amount} onChange={(e) => setFormData((p) => ({ ...p, max_discount_amount: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Min Order Amount</Label>
                <Input type="number" placeholder="0" value={formData.min_order_amount} onChange={(e) => setFormData((p) => ({ ...p, min_order_amount: Number(e.target.value) }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Usage Limit</Label>
                <Input type="number" placeholder="100" value={formData.usage_limit} onChange={(e) => setFormData((p) => ({ ...p, usage_limit: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Valid From</Label>
                <Input type="date" value={formData.valid_from} onChange={(e) => setFormData((p) => ({ ...p, valid_from: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Valid Until</Label>
                <Input type="date" value={formData.valid_until} onChange={(e) => setFormData((p) => ({ ...p, valid_until: e.target.value }))} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formData.is_active} onCheckedChange={(v) => setFormData((p) => ({ ...p, is_active: v }))} />
              <Label className="text-xs">Active</Label>
            </div>
            <Button onClick={handleUpdate} disabled={updateCoupon.isPending}>
              {updateCoupon.isPending ? "Updating..." : "Update"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
