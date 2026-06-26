"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { useProducts, useCreateProduct } from "@/hooks/use-products";
import { DataTable } from "@/components/ui/data-table";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { PRODUCT_CATEGORY_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils/format";
import type { Product, ProductCategory } from "@/types";
import type { ProductFilters } from "@/hooks/use-products";

export default function ProductsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<ProductFilters>({});
  const { data: products, isLoading, error } = useProducts(filters);
  const createProduct = useCreateProduct();
  const [createOpen, setCreateOpen] = useState(false);
  const [formData, setFormData] = useState<any>({
    name: "", sku: "", category: "MENS_WEAR", price: 0, cost_price: 0,
    description: "", size: "", color: "", material: "", images: [], tags: [],
  });

  const handleCreate = async () => {
    try {
      await createProduct.mutateAsync(formData);
      toast.success("Product created");
      setCreateOpen(false);
    } catch {
      toast.error("Failed to create product");
    }
  };

  const handleRowClick = useCallback(
    (product: Product) => {
      router.push(`/products/${product.id}`);
    },
    [router]
  );

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        accessorKey: "sku",
        header: "SKU",
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => PRODUCT_CATEGORY_LABELS[row.original.category],
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => formatCurrency(row.original.price),
      },
      {
        accessorKey: "size",
        header: "Size",
        cell: ({ row }) => row.original.size ?? "-",
      },
      {
        accessorKey: "color",
        header: "Color",
        cell: ({ row }) => row.original.color ?? "-",
      },
      {
        accessorKey: "is_active",
        header: "Active",
        cell: ({ row }) => (
          <Badge variant={row.original.is_active ? "default" : "secondary"}>
            {row.original.is_active ? "Yes" : "No"}
          </Badge>
        ),
      },
    ],
    []
  );

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-destructive">Failed to load products</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select
          value={filters.category?.[0] ?? ""}
          onValueChange={(v) => setFilters((p: ProductFilters) => ({ ...p, category: v ? [v] : undefined }))}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">All</SelectItem>
            {Object.entries(PRODUCT_CATEGORY_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Size"
          className="w-[100px]"
          value={filters.size ?? ""}
          onChange={(e) => setFilters((p: ProductFilters) => ({ ...p, size: e.target.value || undefined }))}
        />
        <Input
          placeholder="Color"
          className="w-[100px]"
          value={filters.color ?? ""}
          onChange={(e) => setFilters((p: ProductFilters) => ({ ...p, color: e.target.value || undefined }))}
        />
        <Input
          type="number" placeholder="Min price" className="w-[120px]"
          value={filters.min_price ?? ""}
          onChange={(e) => setFilters((p: ProductFilters) => ({ ...p, min_price: e.target.value ? Number(e.target.value) : undefined }))}
        />
        <Input
          type="number" placeholder="Max price" className="w-[120px]"
          value={filters.max_price ?? ""}
          onChange={(e) => setFilters((p: ProductFilters) => ({ ...p, max_price: e.target.value ? Number(e.target.value) : undefined }))}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={products ?? []}
          searchKey="name"
          onRowClick={handleRowClick}
        />
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Product</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <Input placeholder="Name" value={formData.name} onChange={(e) => setFormData((p: any) => ({ ...p, name: e.target.value }))} />
            <Input placeholder="SKU" value={formData.sku} onChange={(e) => setFormData((p: any) => ({ ...p, sku: e.target.value }))} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select value={formData.category} onValueChange={(v) => setFormData((p: any) => ({ ...p, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PRODUCT_CATEGORY_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input type="number" placeholder="Price" value={formData.price || ""} onChange={(e) => setFormData((p: any) => ({ ...p, price: Number(e.target.value) }))} />
              <Input type="number" placeholder="Cost Price" value={formData.cost_price || ""} onChange={(e) => setFormData((p: any) => ({ ...p, cost_price: Number(e.target.value) }))} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input placeholder="Size" value={formData.size ?? ""} onChange={(e) => setFormData((p: any) => ({ ...p, size: e.target.value }))} />
              <Input placeholder="Color" value={formData.color ?? ""} onChange={(e) => setFormData((p: any) => ({ ...p, color: e.target.value }))} />
              <Input placeholder="Material" value={formData.material ?? ""} onChange={(e) => setFormData((p: any) => ({ ...p, material: e.target.value }))} />
            </div>
            <Button onClick={handleCreate} disabled={createProduct.isPending}>
              {createProduct.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
