'use client';

import { useState } from 'react';
import { useBadges } from '@/hooks/use-badges';
import { DataTable } from '@/components/dashboard/data-table';
import { getBadgeColumns } from '@/components/dashboard/badges/badge-columns';
import { BadgeModal } from '@/components/dashboard/badges/badge-modal';
import { ConfirmDialog } from '@/components/dashboard/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { BadgeWithAwardCount } from '@/services/badge';

export default function BadgesPage() {
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<BadgeWithAwardCount | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [badgeToDelete, setBadgeToDelete] = useState<BadgeWithAwardCount | null>(null);

  const {
    data,
    totalCount,
    loading,
    createBadge,
    updateBadge,
    deleteBadge,
    isCreating,
    isUpdating,
    isDeleting,
  } = useBadges();

  const handleEdit = (badge: BadgeWithAwardCount) => {
    setEditingBadge(badge);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = (badge: BadgeWithAwardCount) => {
    setBadgeToDelete(badge);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (badgeToDelete) {
      deleteBadge(badgeToDelete.id);
      setDeleteConfirmOpen(false);
      setBadgeToDelete(null);
    }
  };

  const handleSubmit = (data: any) => {
    if (modalMode === 'add') {
      createBadge(data);
    } else if (editingBadge) {
      updateBadge(editingBadge.id, data);
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
          <h1 className="text-3xl font-bold text-deep-amethyst">Badges</h1>
          <p className="text-gray-600 mt-1">Manage achievement badges</p>
        </div>
      </div>

      <DataTable
        data={data}
        columns={getBadgeColumns()}
        totalCount={totalCount}
        currentPage={1}
        pageSize={data.length}
        actions={actions}
        addButton={{
          label: 'Create Badge',
          onClick: () => {
            setModalMode('add');
            setEditingBadge(null);
            setIsModalOpen(true);
          },
        }}
      />

      <BadgeModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        mode={modalMode}
        badge={editingBadge}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Badge"
        description={`Are you sure you want to delete "${badgeToDelete?.name}"? All user badge awards will be removed.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
