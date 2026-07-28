"use client";

import React from "react";
import { Hash } from "lucide-react";
import { PermissionGuard } from "../../shared/components/PermissionGuard";
import { AdminNavTabs } from "../../shared/components/AdminNavTabs";
import { SequenceList } from "../components/SequenceList";
import { SequenceFormDialog } from "../components/SequenceFormDialog";
import { useNumberingSequences, useUpdateSequence } from "../hooks/use-numbering-sequences";
import type { NumberingSequence, UpdateSequenceDTO } from "../types";

export function NumberingSequencesPage() {
  const { data: sequences, isLoading } = useNumberingSequences();
  const updateSequenceMutation = useUpdateSequence();

  const [editingSequence, setEditingSequence] = React.useState<NumberingSequence | null>(null);

  const handleUpdate = async (id: string, payload: UpdateSequenceDTO) => {
    await updateSequenceMutation.mutateAsync({ id, payload });
  };

  return (
    <PermissionGuard requiredPermission="settings.edit">
      <div className="space-y-6 p-6">
        {/* Page Header */}
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
            <Hash className="h-6 w-6 text-primary" />
            Document Numbering Sequences
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage auto-incrementing serial number formats, prefixes, suffixes, and padding for Purchase Orders, GRNs, and Releases.
          </p>
        </div>

        {/* Subnav Tabs */}
        <AdminNavTabs />

        {/* List */}
        <SequenceList
          sequences={sequences || []}
          isLoading={isLoading}
          onEditSequence={(seq) => setEditingSequence(seq)}
        />

        {/* Edit Dialog */}
        <SequenceFormDialog
          sequence={editingSequence}
          isOpen={!!editingSequence}
          onClose={() => setEditingSequence(null)}
          onUpdate={handleUpdate}
          isSubmitting={updateSequenceMutation.isPending}
        />
      </div>
    </PermissionGuard>
  );
}
