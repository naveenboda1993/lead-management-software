"use client";

import { useMemo } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format";
import { PRODUCT_CATEGORY_LABELS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

const supabase = createClient();

export default function InventoryPage() {
  const { data: products, isLoading } = useProducts();
  const { data: inventory } = useQuery({
    queryKey: ["inventory-all"],
    queryFn: async () => {
      const { data } = await supabase.from("inventory").select("*");
      return data ?? [];
    },
  });

  const inventoryMap = useMemo(() => {
    const map = new Map<string, { quantity: number; reorder_level: number; warehouse_location: string | null }>();
    (inventory ?? []).forEach((inv: any) => {
      map.set(inv.product_id, inv);
    });
    return map;
  }, [inventory]);

  const lowStockItems = useMemo(() => {
    if (!products || !inventory) return [];
    return products.filter((p) => {
      const inv = inventoryMap.get(p.id);
      return inv && inv.quantity <= inv.reorder_level;
    });
  }, [products, inventory, inventoryMap]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
        <p className="text-muted-foreground">Manage stock levels and low stock alerts</p>
      </div>

      {lowStockItems.length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-base">Low Stock Alerts</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockItems.map((product) => {
                const inv = inventoryMap.get(product.id);
                return (
                  <div key={product.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${inv && inv.quantity <= inv.reorder_level ? "text-destructive" : ""}`}>
                        {inv?.quantity ?? 0} in stock
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Reorder at: {inv?.reorder_level ?? 0}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 text-sm font-medium">Product</th>
                <th className="text-left p-3 text-sm font-medium">SKU</th>
                <th className="text-left p-3 text-sm font-medium">Category</th>
                <th className="text-left p-3 text-sm font-medium">Price</th>
                <th className="text-left p-3 text-sm font-medium">In Stock</th>
                <th className="text-left p-3 text-sm font-medium">Reorder Level</th>
                <th className="text-left p-3 text-sm font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {products?.map((product) => {
                const inv = inventoryMap.get(product.id);
                const qty = inv?.quantity ?? 0;
                const reorder = inv?.reorder_level ?? 0;
                const isLow = qty <= reorder;
                return (
                  <tr key={product.id} className="border-b">
                    <td className="p-3 text-sm font-medium">{product.name}</td>
                    <td className="p-3 text-sm">{product.sku}</td>
                    <td className="p-3 text-sm">{PRODUCT_CATEGORY_LABELS[product.category]}</td>
                    <td className="p-3 text-sm">{formatCurrency(product.price)}</td>
                    <td className={`p-3 text-sm font-bold ${isLow ? "text-destructive" : ""}`}>{qty}</td>
                    <td className="p-3 text-sm">{reorder}</td>
                    <td className="p-3">
                      {isLow ? (
                        <Badge variant="destructive">Low Stock</Badge>
                      ) : (
                        <Badge variant="default">In Stock</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
