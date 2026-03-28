'use client';

import { useState } from 'react';
import { DataTable } from '@/components/dashboard/data-table';
import { SearchInput } from '@/components/dashboard/search-input';
import { getBusStopColumns } from '@/components/dashboard/bus-stops/bus-stop-columns';
import { BusStopModal } from '@/components/dashboard/bus-stops/bus-stop-modal';
import { ConfirmDialog } from '@/components/dashboard/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { BusStop } from '@/services/bus-stop';
import { updateBusStop, deleteBusStop } from '@/actions/bus-stop';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const statusTabs = [
  { label: 'All', value: undefined },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

interface BusStopsClientProps {
  busStops: BusStop[];
  totalCount: number;
  currentPage: number;
  userRole: 'admin' | 'moderator';
  currentStatus?: string;
  currentSearch: string;
}

export function BusStopsClient({
  busStops,
  totalCount,
  currentPage,
  userRole,
  currentStatus,
  currentSearch,
}: BusStopsClientProps) {
  const router = useRouter();
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBusStop, setSelectedBusStop] = useState<BusStop | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [busStopToDelete, setBusStopToDelete] = useState<BusStop | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleView = (busStop: BusStop) => {
    setSelectedBusStop(busStop);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEdit = (busStop: BusStop) => {
    setSelectedBusStop(busStop);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = (busStop: BusStop) => {
    setBusStopToDelete(busStop);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!busStopToDelete) return;

    setIsSubmitting(true);
    const result = await deleteBusStop(busStopToDelete.id);
    setIsSubmitting(false);

    if (result.success) {
      toast.success('Bus stop deleted successfully');
      setDeleteConfirmOpen(false);
      setBusStopToDelete(null);
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to delete bus stop');
    }
  };

  const handleSubmit = async (data: any) => {
    if (!selectedBusStop) return;

    setIsSubmitting(true);
    const result = await updateBusStop(selectedBusStop.id, data);
    setIsSubmitting(false);

    if (result.success) {
      toast.success('Bus stop updated successfully');
      setIsModalOpen(false);
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to update bus stop');
    }
  };

  const actions = [
    {
      key: 'view',
      label: 'View',
      icon: <Eye className="w-3 h-3 mr-1" />,
      onClick: handleView,
      variant: 'outline' as const,
    },
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
          <h1 className="text-3xl font-bold text-deep-amethyst">Bus Stops</h1>
          <p className="text-gray-600 mt-1">Manage bus stop submissions</p>
        </div>
        {userRole === 'admin' && (
          <Button asChild>
            <Link href="/dashboard/bus-stops/new">
              <Plus className="w-4 h-4" />
              Create Bus Stop
            </Link>
          </Button>
        )}
      </div>

      <SearchInput placeholder="Search bus stops..." />

      <div className="flex gap-2 border-b border-gray-200">
        {statusTabs.map((tab) => {
          const isActive = tab.value === currentStatus || (!tab.value && !currentStatus);
          const href = tab.value
            ? `?status=${tab.value}${currentSearch ? `&search=${currentSearch}` : ''}`
            : currentSearch
              ? `?search=${currentSearch}`
              : '/dashboard/bus-stops';

          return (
            <Link
              key={tab.label}
              href={href}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-plum-builder text-plum-builder'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <DataTable
        data={busStops}
        columns={getBusStopColumns()}
        totalCount={totalCount}
        currentPage={currentPage}
        pageSize={20}
        actions={actions}
      />

      <BusStopModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        mode={modalMode}
        busStop={selectedBusStop}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Bus Stop"
        description={`Are you sure you want to delete "${busStopToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
