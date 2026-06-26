"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useOrder } from "@/hooks/use-orders";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils/format";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const { data: order, isLoading, error } = useOrder(orderId);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-3">
        <p className="text-destructive">Order not found</p>
        <Button variant="outline" onClick={() => router.push("/orders")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/orders")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">Order {order.order_number}</h1>
            <Badge className={ORDER_STATUS_COLORS[order.status]} variant="outline">
              {ORDER_STATUS_LABELS[order.status]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Order Items</CardTitle></CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-2 text-xs font-medium">Product</th>
                      <th className="text-left p-2 text-xs font-medium">Qty</th>
                      <th className="text-left p-2 text-xs font-medium">Price</th>
                      <th className="text-left p-2 text-xs font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-2 text-sm">
                          <span className="font-medium">{item.product_name}</span>
                          {item.size && <span className="text-muted-foreground"> ({item.size})</span>}
                          {item.color && <span className="text-muted-foreground"> / {item.color}</span>}
                        </td>
                        <td className="p-2 text-sm">{item.quantity}</td>
                        <td className="p-2 text-sm">{formatCurrency(item.unit_price)}</td>
                        <td className="p-2 text-sm font-medium">{formatCurrency(item.total_price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Order Summary</CardTitle></CardHeader>
            <CardContent>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-green-600">-{formatCurrency(order.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatCurrency(order.tax_amount)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-medium">
                  <span>Total</span>
                  <span>{formatCurrency(order.total_amount)}</span>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
            <CardContent>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment</span>
                  <Badge variant="outline">{order.payment_status}</Badge>
                </div>
                {order.payment_method && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Method</span>
                    <span>{order.payment_method}</span>
                  </div>
                )}
                {order.coupon_code && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Coupon</span>
                    <span>{order.coupon_code}</span>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          {(order.shipping_address || order.billing_address) && (
            <Card>
              <CardHeader><CardTitle className="text-base">Addresses</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                {order.shipping_address && <p><span className="text-muted-foreground">Shipping:</span> {order.shipping_address}</p>}
                {order.billing_address && <p><span className="text-muted-foreground">Billing:</span> {order.billing_address}</p>}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
