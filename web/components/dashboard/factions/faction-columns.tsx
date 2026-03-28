import { ColumnDef } from '@/components/dashboard/data-table';
import { FactionWithMemberCount } from '@/services/faction';

export function getFactionColumns(): ColumnDef<FactionWithMemberCount>[] {
  return [
    {
      header: 'Name',
      cell: (row) => <span className="font-medium text-deep-amethyst">{row.name}</span>,
    },
    {
      header: 'Description',
      cell: (row) => <span className="text-gray-600">{row.description || '—'}</span>,
    },
    {
      header: 'Total Score',
      cell: (row) => row.total_score?.toLocaleString() || '0',
    },
    {
      header: 'Members',
      cell: (row) => row.member_count.toLocaleString(),
    },
  ];
}
