"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { useProperties, useCreateProperty } from "@/hooks/use-properties";
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
import { PROPERTY_TYPE_LABELS, PROPERTY_STATUS_LABELS, PROPERTY_STATUS_COLORS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { Property } from "@/types";
import type { PropertyFilters as PropertyFiltersType } from "@/hooks/use-properties";

export default function PropertiesPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<PropertyFiltersType>({});
  const { data: properties, isLoading, error } = useProperties(filters);
  const createProperty = useCreateProperty();

  const [createOpen, setCreateOpen] = useState(false);
  const [formData, setFormData] = useState<any>({
    property_name: "",
    property_type: "APARTMENT",
    status: "AVAILABLE",
    price: 0,
    location: "",
    city: "",
    state: "",
    country: "US",
    area_sqft: 0,
    bedrooms: 1,
    bathrooms: 1,
    description: "",
    amenities: [] as string[],
    images: [] as string[],
    documents: [] as string[],
  });

  const handleCreate = async () => {
    try {
      await createProperty.mutateAsync(formData);
      toast.success("Property created successfully");
      setCreateOpen(false);
      setFormData({
        property_name: "", property_type: "APARTMENT", status: "AVAILABLE", price: 0,
        location: "", city: "", state: "", country: "US", area_sqft: 0,
        bedrooms: 1, bathrooms: 1, description: "", amenities: [], images: [], documents: [],
      });
    } catch {
      toast.error("Failed to create property");
    }
  };

  const handleRowClick = useCallback(
    (property: Property) => {
      router.push(`/properties/${property.id}`);
    },
    [router]
  );

  const columns = useMemo<ColumnDef<Property>[]>(
    () => [
      {
        accessorKey: "property_name",
        header: "Property Name",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.property_name}</span>
        ),
      },
      {
        accessorKey: "property_type",
        header: "Type",
        cell: ({ row }) => PROPERTY_TYPE_LABELS[row.original.property_type],
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge className={PROPERTY_STATUS_COLORS[row.original.status]} variant="outline">
            {PROPERTY_STATUS_LABELS[row.original.status]}
          </Badge>
        ),
      },
      {
        accessorKey: "city",
        header: "City",
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => formatCurrency(row.original.price),
      },
      {
        accessorKey: "bedrooms",
        header: "Beds",
      },
      {
        accessorKey: "area_sqft",
        header: "Area (sqft)",
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
        <p className="text-destructive">Failed to load properties</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Properties</h1>
          <p className="text-muted-foreground">Manage your real estate properties</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Property
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select
          value={filters.type?.[0] ?? ""}
          onValueChange={(v) => setFilters((p: PropertyFiltersType) => ({ ...p, type: v ? [v] : undefined }))}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">All Types</SelectItem>
            {Object.entries(PROPERTY_TYPE_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.status?.[0] ?? ""}
          onValueChange={(v) => setFilters((p: PropertyFiltersType) => ({ ...p, status: v ? [v] : undefined }))}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">All Statuses</SelectItem>
            {Object.entries(PROPERTY_STATUS_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="City..."
          className="w-[150px]"
          value={filters.city ?? ""}
          onChange={(e) => setFilters((p: PropertyFiltersType) => ({ ...p, city: e.target.value || undefined }))}
        />
        <Input
          type="number"
          placeholder="Min price"
          className="w-[130px]"
          value={filters.min_price ?? ""}
          onChange={(e) => setFilters((p: PropertyFiltersType) => ({ ...p, min_price: e.target.value ? Number(e.target.value) : undefined }))}
        />
        <Input
          type="number"
          placeholder="Max price"
          className="w-[130px]"
          value={filters.max_price ?? ""}
          onChange={(e) => setFilters((p: PropertyFiltersType) => ({ ...p, max_price: e.target.value ? Number(e.target.value) : undefined }))}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={properties ?? []}
          searchKey="property_name"
          onRowClick={handleRowClick}
        />
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Property</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <Input
              placeholder="Property Name"
              value={formData.property_name}
              onChange={(e) => setFormData((p: any) => ({ ...p, property_name: e.target.value }))}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                value={formData.property_type}
                onValueChange={(v) => setFormData((p: any) => ({ ...p, property_type: v }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PROPERTY_TYPE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData((p: any) => ({ ...p, status: v }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PROPERTY_STATUS_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                type="number" placeholder="Price"
                value={formData.price || ""}
                onChange={(e) => setFormData((p: any) => ({ ...p, price: Number(e.target.value) }))}
              />
              <Input
                type="number" placeholder="Bedrooms"
                value={formData.bedrooms}
                onChange={(e) => setFormData((p: any) => ({ ...p, bedrooms: Number(e.target.value) }))}
              />
              <Input
                type="number" placeholder="Bathrooms"
                value={formData.bathrooms}
                onChange={(e) => setFormData((p: any) => ({ ...p, bathrooms: Number(e.target.value) }))}
              />
            </div>
            <Input
              placeholder="Location"
              value={formData.location}
              onChange={(e) => setFormData((p: any) => ({ ...p, location: e.target.value }))}
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                placeholder="City"
                value={formData.city}
                onChange={(e) => setFormData((p: any) => ({ ...p, city: e.target.value }))}
              />
              <Input
                placeholder="State"
                value={formData.state}
                onChange={(e) => setFormData((p: any) => ({ ...p, state: e.target.value }))}
              />
              <Input
                placeholder="Country"
                value={formData.country}
                onChange={(e) => setFormData((p: any) => ({ ...p, country: e.target.value }))}
              />
            </div>
            <Input
              type="number" placeholder="Area (sqft)"
              value={formData.area_sqft || ""}
              onChange={(e) => setFormData((p: any) => ({ ...p, area_sqft: Number(e.target.value) }))}
            />
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData((p: any) => ({ ...p, description: e.target.value }))}
            />
            <Input
              placeholder="Amenities (comma-separated, e.g. Pool, Gym, Parking)"
              value={formData.amenities.join(", ")}
              onChange={(e) => setFormData((p: any) => ({ ...p, amenities: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) }))}
            />
            <Button onClick={handleCreate} disabled={createProperty.isPending}>
              {createProperty.isPending ? "Creating..." : "Create Property"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
