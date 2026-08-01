"use client";

/**
 * SupplierDetailPage — detail view for a single supplier.
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  RotateCcw,
  Building2,
  Mail,
  Phone,
  MapPin,
  User,
  StickyNote,
} from "lucide-react";
import { useSupplier, useDeleteSupplier, useRestoreSupplier } from "../../hooks/use-suppliers";
import { SupplierFormDialog } from "../components/SupplierFormDialog";
import { Button } from "@/app/components/ui/button";
import { Skeleton } from "@/app/components/ui/skeleton";
import { Separator } from "@/app/components/ui/separator";
import {
  PageContainer,
  PageHeader,
  Breadcrumb,
  StatusBadge,
  DeleteDialog,
  PermissionGuard,
  ErrorState,
} from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { formatDate } from "@/utils/format";
import { usePageTitle } from "@/hooks/use-page-title";
import type { Supplier } from "../../types";

interface SupplierDetailPageProps {
  supplierId: string;
}

function DetailRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  href?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        {href ? (
          <a href={href} className="text-sm hover:text-primary break-all">
            {value}
          </a>
        ) : (
          <p className="text-sm text-foreground break-words">{value || "—"}</p>
        )}
      </div>
    </div>
  );
}

function SupplierDetailSkeleton() {
  return (
    <PageContainer>
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-20" />
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </PageContainer>
  );
}

export function SupplierDetailPage({ supplierId }: SupplierDetailPageProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const { data: supplier, isLoading, error, refetch } = useSupplier(supplierId);
  const deleteMutation = useDeleteSupplier();
  const restoreMutation = useRestoreSupplier();

  usePageTitle(supplier?.company_name);

  if (isLoading) return <SupplierDetailSkeleton />;
  if (error) return (
    <PageContainer>
      <ErrorState error={error} onRetry={refetch} />
    </PageContainer>
  );
  if (!supplier) return null;

  async function handleDelete() {
    await deleteMutation.mutateAsync(supplierId);
    router.push("/suppliers");
  }

  return (
    <PageContainer>
      <PageHeader
        title={supplier.company_name}
        description={supplier.contact_person ? `Contact: ${supplier.contact_person}` : "Supplier details"}
        breadcrumb={
          <Breadcrumb
            items={[
              { label: "Suppliers", href: "/suppliers" },
              { label: supplier.company_name },
            ]}
          />
        }
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Back
            </Button>
            <PermissionGuard permission="suppliers.edit">
              {supplier.is_active ? (
                <Button size="sm" onClick={() => setEditOpen(true)}>
                  <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                  Edit
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => restoreMutation.mutate(supplierId)}
                  disabled={restoreMutation.isPending}
                >
                  <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
                  Restore
                </Button>
              )}
            </PermissionGuard>
            <PermissionGuard permission="suppliers.delete">
              {supplier.is_active && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDeleteOpen(true)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                  Delete
                </Button>
              )}
            </PermissionGuard>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Company Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4" aria-hidden="true" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            <DetailRow
              icon={<Building2 className="h-4 w-4" />}
              label="Company Name"
              value={supplier.company_name}
            />
            <DetailRow
              icon={<User className="h-4 w-4" />}
              label="Contact Person"
              value={supplier.contact_person}
            />
            <DetailRow
              icon={<Mail className="h-4 w-4" />}
              label="Email"
              value={supplier.email}
              href={supplier.email ? `mailto:${supplier.email}` : undefined}
            />
            <DetailRow
              icon={<Phone className="h-4 w-4" />}
              label="Phone"
              value={supplier.phone}
              href={supplier.phone ? `tel:${supplier.phone}` : undefined}
            />
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              Address
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            <DetailRow
              icon={<MapPin className="h-4 w-4" />}
              label="Street Address"
              value={supplier.address}
            />
            <DetailRow
              icon={<MapPin className="h-4 w-4" />}
              label="City"
              value={supplier.city}
            />
            <DetailRow
              icon={<MapPin className="h-4 w-4" />}
              label="Country"
              value={supplier.country}
            />
          </CardContent>
        </Card>

        {/* Notes */}
        {supplier.notes && (
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <StickyNote className="h-4 w-4" aria-hidden="true" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">{supplier.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Meta */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Record Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <StatusBadge variant={supplier.is_active ? "active" : "inactive"} dot />
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span>{formatDate(supplier.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Updated</span>
              <span>{formatDate(supplier.updatedAt)}</span>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Edit dialog */}
      <SupplierFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        supplier={supplier}
      />

      {/* Delete confirmation */}
      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        itemName={supplier.company_name}
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </PageContainer>
  );
}
