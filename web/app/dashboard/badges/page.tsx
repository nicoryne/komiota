import { BadgeService } from '@/services/badge';
import { DataTable, ColumnDef } from '@/components/dashboard/data-table';
import { ConfirmDialog } from '@/components/dashboard/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { deleteBadge } from '@/actions/badge';

type BadgeRow = {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  criteria: string | null;
  award_count: number;
};

export default async function BadgesPage() {
  const result = await BadgeService.list();
  const badges = result.success ? result.data : [];

  const columns: ColumnDef<BadgeRow>[] = [
    {
      header: 'Name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          {row.icon_url && (
            <img
              src={row.icon_url}
              alt={row.name}
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="font-medium text-[#1C1A22]">{row.name}</span>
        </div>
      ),
    },
    {
      header: 'Description',
      cell: (row) => (
        <span className="text-gray-600">{row.description || '—'}</span>
      ),
    },
    {
      header: 'Criteria',
      cell: (row) => (
        <span className="text-sm text-gray-600">{row.criteria || '—'}</span>
      ),
    },
    {
      header: 'Awards',
      cell: (row) => row.award_count.toLocaleString(),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" asChild>
            <a href={`/dashboard/badges/${row.id}/edit`}>Edit</a>
          </Button>
          <ConfirmDialog
            trigger={
              <Button size="sm" variant="destructive">
                <Trash2 className="w-3 h-3" />
              </Button>
            }
            title="Delete Badge"
            description={`Are you sure you want to delete "${row.name}"? All user badge awards will be removed.`}
            confirmLabel="Delete"
            onConfirm={async () => {
              'use server';
              await deleteBadge(row.id);
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1C1A22]">Badges</h1>
          <p className="text-gray-600 mt-1">Manage achievement badges</p>
        </div>
        <Button asChild>
          <a href="/dashboard/badges/new">
            <Plus className="w-4 h-4" />
            Create Badge
          </a>
        </Button>
      </div>

      <DataTable
        data={badges}
        columns={columns}
        totalCount={badges.length}
        currentPage={1}
        pageSize={badges.length}
      />
    </div>
  );
}
