"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useSupplier } from "@/hooks/use-suppliers";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/utils/format";

export default function SupplierDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supplierId = params.id as string;
  const { data: supplier, isLoading, error } = useSupplier(supplierId);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-3">
        <p className="text-destructive">Supplier not found</p>
        <Button variant="outline" onClick={() => router.push("/suppliers")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/suppliers")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">{supplier.name}</h1>
          <p className="text-sm text-muted-foreground">{supplier.company}</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Supplier Information</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium text-muted-foreground">Name</dt>
              <dd className="text-sm">{supplier.name}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground">Company</dt>
              <dd className="text-sm">{supplier.company}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground">Email</dt>
              <dd className="text-sm">{supplier.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground">Phone</dt>
              <dd className="text-sm">{supplier.phone}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground">Payment Terms</dt>
              <dd className="text-sm">{supplier.payment_terms}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground">Lead Time</dt>
              <dd className="text-sm">{supplier.lead_time_days} days</dd>
            </div>
            {supplier.address && (
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium text-muted-foreground">Address</dt>
                <dd className="text-sm">{supplier.address}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs font-medium text-muted-foreground">Created</dt>
              <dd className="text-sm">{formatDate(supplier.created_at)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground">Last Updated</dt>
              <dd className="text-sm">{formatDate(supplier.updated_at)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
