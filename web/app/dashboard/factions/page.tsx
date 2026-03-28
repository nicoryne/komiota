import { FactionService } from '@/services/faction';
import { DataTable, ColumnDef } from '@/components/dashboard/data-table';
import { ConfirmDialog } from '@/components/dashboard/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { deleteFaction } from '@/actions/faction';

type FactionRow = {
  id: string;
  name: string;
  description: string | null;
  total_score: number | null;
  member_count: number;
};

export default async function FactionsPage() {
  const result = await FactionService.list();
  const factions = result.success ? result.data : [];

  const columns: ColumnDef<FactionRow>[] = [
    {
      header: 'Name',
      cell: (row) => (
        <span className="font-medium text-[#1C1A22]">{row.name}</span>
      ),
    },
    {
      header: 'Description',
      cell: (row) => (
        <span className="text-gray-600">{row.description || '—'}</span>
      ),
    },
    {
      header: 'Total Score',
      cell: (row) => row.total_score?.toLocaleString() || '0',
    },
    {
      header: 'Members',
      cell: (row) => row.member_count.toLocaleString(),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" asChild>
            <a href={`/dashboard/factions/${row.id}/edit`}>Edit</a>
          </Button>
          <ConfirmDialog
            trigger={
              <Button size="sm" variant="destructive">
                <Trash2 className="w-3 h-3" />
              </Button>
            }
            title="Delete Faction"
            description={`Are you sure you want to delete "${row.name}"? All members will be removed from this faction.`}
            confirmLabel="Delete"
            onConfirm={async () => {
              'use server';
              await deleteFaction(row.id);
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
          <h1 className="text-3xl font-bold text-[#1C1A22]">Factions</h1>
          <p className="text-gray-600 mt-1">Manage community factions</p>
        </div>
        <Button asChild>
          <a href="/dashboard/factions/new">
            <Plus className="w-4 h-4" />
            Create Faction
          </a>
        </Button>
      </div>

      <DataTable
        data={factions}
        columns={columns}
        totalCount={factions.length}
        currentPage={1}
        pageSize={factions.length}
      />
    </div>
  );
}
