"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { useOrders } from "@/hooks/use-orders";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { Order } from "@/types";

export default function OrdersPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<{ status?: string[]; date_from?: string; date_to?: string }>({});
  const { data: orders, isLoading, error } = useOrders();

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter((order) => {
      if (filters.status?.length && !filters.status.includes(order.status)) return false;
      if (filters.date_from && new Date(order.created_at) < new Date(filters.date_from)) return false;
      if (filters.date_to && new Date(order.created_at) > new Date(filters.date_to)) return false;
      return true;
    });
  }, [orders, filters]);

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
        header: "Items",
        cell: ({ row }) => <span className="text-sm">{row.original.items.length} item(s)</span>,
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

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-destructive">Failed to load orders</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">Manage customer orders</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select
          value={filters.status?.[0] ?? ""}
          onValueChange={(v) => setFilters((p) => ({ ...p, status: v ? [v] : undefined }))}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">All</SelectItem>
            {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input type="date" className="w-[150px]" value={filters.date_from ?? ""} onChange={(e) => setFilters((p) => ({ ...p, date_from: e.target.value || undefined }))} />
        <Input type="date" className="w-[150px]" value={filters.date_to ?? ""} onChange={(e) => setFilters((p) => ({ ...p, date_to: e.target.value || undefined }))} />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredOrders}
          searchKey="order_number"
          onRowClick={handleRowClick}
        />
      )}
    </div>
  );
}
