'use client';

import { useState } from 'react';
import { useFactions } from '@/hooks/use-factions';
import { DataTable } from '@/components/dashboard/data-table';
import { getFactionColumns } from '@/components/dashboard/factions/faction-columns';
import { FactionModal } from '@/components/dashboard/factions/faction-modal';
import { ConfirmDialog } from '@/components/dashboard/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { FactionWithMemberCount } from '@/services/faction';

export default function FactionsPage() {
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaction, setEditingFaction] = useState<FactionWithMemberCount | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [factionToDelete, setFactionToDelete] = useState<FactionWithMemberCount | null>(null);

  const {
    data,
    totalCount,
    loading,
    createFaction,
    updateFaction,
    deleteFaction,
    isCreating,
    isUpdating,
    isDeleting,
  } = useFactions();

  const handleEdit = (faction: FactionWithMemberCount) => {
    setEditingFaction(faction);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = (faction: FactionWithMemberCount) => {
    setFactionToDelete(faction);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (factionToDelete) {
      deleteFaction(factionToDelete.id);
      setDeleteConfirmOpen(false);
      setFactionToDelete(null);
    }
  };

  const handleSubmit = (data: any) => {
    if (modalMode === 'add') {
      createFaction(data);
    } else if (editingFaction) {
      updateFaction(editingFaction.id, data);
    }
  };

  const actions = [
    {
      key: 'edit',
      label: 'Edit',
      icon: <Pencil className="w-3 h-3 mr-1" />,
      onClick: handleEdit,
      variant: 'outline' as const,
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: <Trash2 className="w-3 h-3 mr-1" />,
      onClick: handleDelete,
      variant: 'destructive' as const,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-deep-amethyst">Factions</h1>
          <p className="text-gray-600 mt-1">Manage community factions</p>
        </div>
      </div>

      <DataTable
        data={data}
        columns={getFactionColumns()}
        totalCount={totalCount}
        currentPage={1}
        pageSize={data.length}
        actions={actions}
        addButton={{
          label: 'Create Faction',
          onClick: () => {
            setModalMode('add');
            setEditingFaction(null);
            setIsModalOpen(true);
          },
        }}
      />

      <FactionModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        mode={modalMode}
        faction={editingFaction}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Faction"
        description={`Are you sure you want to delete "${factionToDelete?.name}"? All members will be removed from this faction.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
