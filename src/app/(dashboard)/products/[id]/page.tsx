"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Package } from "lucide-react";
import { useProduct, useUpdateProduct } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { PRODUCT_CATEGORY_LABELS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils/format";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const { data: product, isLoading, error } = useProduct(productId);
  const updateProduct = useUpdateProduct();

  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "", sku: "", price: 0, cost_price: 0,
    description: "", size: "", color: "", material: "",
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-3">
        <p className="text-destructive">Product not found</p>
        <Button variant="outline" onClick={() => router.push("/products")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
    );
  }

  const handleEdit = () => {
    setFormData({
      name: product.name, sku: product.sku,
      price: product.price, cost_price: product.cost_price,
      description: product.description ?? "", size: product.size ?? "",
      color: product.color ?? "", material: product.material ?? "",
    });
    setEditing(true);
  };

  const handleUpdate = async () => {
    try {
      await updateProduct.mutateAsync({ id: productId, ...formData });
      toast.success("Product updated");
      setEditing(false);
    } catch {
      toast.error("Failed to update");
    }
  };

  const inventory = (product as any).inventory;

  if (editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setEditing(false)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">Edit Product</h1>
        </div>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Input placeholder="Name" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} />
            <Input placeholder="SKU" value={formData.sku} onChange={(e) => setFormData((p) => ({ ...p, sku: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Input type="number" placeholder="Price" value={formData.price || ""} onChange={(e) => setFormData((p) => ({ ...p, price: Number(e.target.value) }))} />
              <Input type="number" placeholder="Cost Price" value={formData.cost_price || ""} onChange={(e) => setFormData((p) => ({ ...p, cost_price: Number(e.target.value) }))} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Input placeholder="Size" value={formData.size} onChange={(e) => setFormData((p) => ({ ...p, size: e.target.value }))} />
              <Input placeholder="Color" value={formData.color} onChange={(e) => setFormData((p) => ({ ...p, color: e.target.value }))} />
              <Input placeholder="Material" value={formData.material} onChange={(e) => setFormData((p) => ({ ...p, material: e.target.value }))} />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleUpdate} disabled={updateProduct.isPending}>Save</Button>
              <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/products")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">{product.name}</h1>
            <Badge variant={product.is_active ? "default" : "secondary"}>
              {product.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{product.sku} · {PRODUCT_CATEGORY_LABELS[product.category]}</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleEdit} className="ml-auto">Edit</Button>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="inventory">
            <Package className="mr-1 h-4 w-4" />
            Inventory
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Product Information</CardTitle></CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div><dt className="text-xs font-medium text-muted-foreground">Price</dt><dd className="text-sm">{formatCurrency(product.price)}</dd></div>
                <div><dt className="text-xs font-medium text-muted-foreground">Cost Price</dt><dd className="text-sm">{formatCurrency(product.cost_price)}</dd></div>
                <div><dt className="text-xs font-medium text-muted-foreground">Size</dt><dd className="text-sm">{product.size ?? "-"}</dd></div>
                <div><dt className="text-xs font-medium text-muted-foreground">Color</dt><dd className="text-sm">{product.color ?? "-"}</dd></div>
                <div><dt className="text-xs font-medium text-muted-foreground">Material</dt><dd className="text-sm">{product.material ?? "-"}</dd></div>
                <div><dt className="text-xs font-medium text-muted-foreground">Category</dt><dd className="text-sm">{PRODUCT_CATEGORY_LABELS[product.category]}</dd></div>
              </dl>
            </CardContent>
          </Card>
          {product.description && (
            <Card>
              <CardHeader><CardTitle className="text-base">Description</CardTitle></CardHeader>
              <CardContent><p className="text-sm whitespace-pre-wrap">{product.description}</p></CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="inventory">
          <Card>
            <CardHeader><CardTitle className="text-base">Stock Information</CardTitle></CardHeader>
            <CardContent>
              {inventory ? (
                <dl className="grid gap-4 sm:grid-cols-2">
                  <div><dt className="text-xs font-medium text-muted-foreground">Quantity</dt><dd className={`text-sm font-bold ${inventory.quantity <= inventory.reorder_level ? "text-destructive" : ""}`}>{inventory.quantity}</dd></div>
                  <div><dt className="text-xs font-medium text-muted-foreground">Reserved</dt><dd className="text-sm">{inventory.reserved_quantity}</dd></div>
                  <div><dt className="text-xs font-medium text-muted-foreground">Reorder Level</dt><dd className="text-sm">{inventory.reorder_level}</dd></div>
                  <div><dt className="text-xs font-medium text-muted-foreground">Location</dt><dd className="text-sm">{inventory.warehouse_location ?? "-"}</dd></div>
                </dl>
              ) : (
                <p className="text-sm text-muted-foreground">No inventory record</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
