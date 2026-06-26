"use client";

import { useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { useOrders } from "@/hooks/use-orders";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { Order } from "@/types";

export default function PortalOrdersPage() {
  const router = useRouter();
  const { data: orders, isLoading } = useOrders();

  const handleRowClick = useCallback(
    (order: Order) => {
      router.push(`/orders/${order.id}`);
    },
    [router]
  );

  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        accessorKey: "order_number",
        header: "Order #",
        cell: ({ row }) => <span className="font-medium">{row.original.order_number}</span>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge className={ORDER_STATUS_COLORS[row.original.status]} variant="outline">
            {ORDER_STATUS_LABELS[row.original.status]}
          </Badge>
        ),
      },
      {
        accessorKey: "total_amount",
        header: "Total",
        cell: ({ row }) => formatCurrency(row.original.total_amount),
      },
      {
        accessorKey: "payment_status",
        header: "Payment",
        cell: ({ row }) => <Badge variant="outline">{row.original.payment_status}</Badge>,
      },
      {
        accessorKey: "created_at",
        header: "Date",
        cell: ({ row }) => formatDate(row.original.created_at),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Orders</h1>
        <p className="text-muted-foreground">View your order history</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={orders ?? []}
          searchKey="order_number"
          onRowClick={handleRowClick}
        />
      )}
    </div>
  );
}
