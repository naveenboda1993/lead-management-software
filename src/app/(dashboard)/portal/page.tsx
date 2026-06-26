"use client";

import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Ticket,
  Building2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CustomerPortalPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customer Portal</h1>
        <p className="text-muted-foreground">View your orders, tickets, and properties</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push("/portal/orders")}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <ShoppingCart className="h-8 w-8 text-primary" />
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardTitle className="mt-3">My Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">View and track your orders</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push("/portal/tickets")}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Ticket className="h-8 w-8 text-primary" />
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardTitle className="mt-3">Support Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Manage your support tickets</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push("/properties")}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Building2 className="h-8 w-8 text-primary" />
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardTitle className="mt-3">Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Browse available properties</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
