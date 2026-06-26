"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit3, Trash2, Loader2 } from "lucide-react";
import { useProperty, useUpdateProperty, useDeleteProperty } from "@/hooks/use-properties";
import type { PropertyType, PropertyStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { PROPERTY_TYPE_LABELS, PROPERTY_STATUS_LABELS, PROPERTY_STATUS_COLORS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils/format";

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;

  const { data: property, isLoading, error } = useProperty(propertyId);
  const updateProperty = useUpdateProperty();
  const deleteProperty = useDeleteProperty();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
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
  });

  const handleEdit = () => {
    if (!property) return;
    setFormData({
      property_name: property.property_name,
      property_type: property.property_type,
      status: property.status,
      price: property.price,
      location: property.location,
      city: property.city,
      state: property.state,
      country: property.country,
      area_sqft: property.area_sqft,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      description: property.description ?? "",
    });
    setEditing(true);
  };

  const handleUpdate = async () => {
    if (!property) return;
    try {
      await updateProperty.mutateAsync({ id: propertyId, ...formData } as any);
      toast.success("Property updated");
      setEditing(false);
    } catch {
      toast.error("Failed to update property");
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteProperty.mutateAsync(propertyId);
      toast.success("Property deleted");
      router.push("/properties");
    } catch {
      toast.error("Failed to delete property");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-3">
        <p className="text-destructive">Property not found</p>
        <Button variant="outline" onClick={() => router.push("/properties")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Properties
        </Button>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setEditing(false)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">Edit Property</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4">
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Property Name"
                value={formData.property_name}
                onChange={(e) => setFormData((p) => ({ ...p, property_name: e.target.value }))}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Price"
                  type="number"
                  value={formData.price || ""}
                  onChange={(e) => setFormData((p) => ({ ...p, price: Number(e.target.value) }))}
                />
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Location"
                  value={formData.location}
                  onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))}
                />
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="State"
                  value={formData.state}
                  onChange={(e) => setFormData((p) => ({ ...p, state: e.target.value }))}
                />
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Area sqft"
                  type="number"
                  value={formData.area_sqft || ""}
                  onChange={(e) => setFormData((p) => ({ ...p, area_sqft: Number(e.target.value) }))}
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleUpdate} disabled={updateProperty.isPending}>
                  {updateProperty.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/properties")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{property.property_name}</h1>
              <Badge className={PROPERTY_STATUS_COLORS[property.status]} variant="outline">
                {PROPERTY_STATUS_LABELS[property.status]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{property.city}, {property.state}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit3 className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Property Information</CardTitle></CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Type</dt>
                  <dd className="text-sm">{PROPERTY_TYPE_LABELS[property.property_type]}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Status</dt>
                  <dd><Badge className={PROPERTY_STATUS_COLORS[property.status]} variant="outline">{PROPERTY_STATUS_LABELS[property.status]}</Badge></dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Price</dt>
                  <dd className="text-sm font-medium">{formatCurrency(property.price)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Area</dt>
                  <dd className="text-sm">{property.area_sqft.toLocaleString()} sqft</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Bedrooms</dt>
                  <dd className="text-sm">{property.bedrooms}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Bathrooms</dt>
                  <dd className="text-sm">{property.bathrooms}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Location</dt>
                  <dd className="text-sm">{property.location}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">City</dt>
                  <dd className="text-sm">{property.city}, {property.state}, {property.country}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
          {property.description && (
            <Card>
              <CardHeader><CardTitle className="text-base">Description</CardTitle></CardHeader>
              <CardContent><p className="text-sm whitespace-pre-wrap">{property.description}</p></CardContent>
            </Card>
          )}
          {property.amenities.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Amenities</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((a) => (
                    <Badge key={a} variant="secondary">{a}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader><CardTitle className="text-base">Timeline</CardTitle></CardHeader>
            <CardContent>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{formatDate(property.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span>{formatDate(property.updated_at)}</span>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media">
          <Card>
            <CardHeader><CardTitle className="text-base">Images & Media</CardTitle></CardHeader>
            <CardContent>
              {property.images.length === 0 ? (
                <p className="text-sm text-muted-foreground">No images uploaded</p>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {property.images.map((img, i) => (
                    <div key={i} className="aspect-video rounded-lg border bg-muted flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">Image {i + 1}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads">
          <Card>
            <CardHeader><CardTitle className="text-base">Related Leads</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No leads associated with this property.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader><CardTitle className="text-base">Tasks</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No tasks for this property.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader><CardTitle className="text-base">Documents</CardTitle></CardHeader>
            <CardContent>
              {property.documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No documents uploaded</p>
              ) : (
                <div className="space-y-2">
                  {property.documents.map((doc, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                      <span className="text-sm">{doc}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Property</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{property.property_name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleteLoading}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading}>
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
