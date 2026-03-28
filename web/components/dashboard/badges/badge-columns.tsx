import { ColumnDef } from '@/components/dashboard/data-table';
import { BadgeWithAwardCount } from '@/services/badge';

export function getBadgeColumns(): ColumnDef<BadgeWithAwardCount>[] {
  return [
    {
      header: 'Name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          {row.icon_url && (
            <img src={row.icon_url} alt={row.name} className="w-8 h-8 rounded-full" />
          )}
          <span className="font-medium text-deep-amethyst">{row.name}</span>
        </div>
      ),
    },
    {
      header: 'Description',
      cell: (row) => <span className="text-gray-600">{row.description || '—'}</span>,
    },
    {
      header: 'Criteria',
      cell: (row) => <span className="text-sm text-gray-600">{row.criteria || '—'}</span>,
    },
    {
      header: 'Awards',
      cell: (row) => row.award_count.toLocaleString(),
    },
  ];
}
