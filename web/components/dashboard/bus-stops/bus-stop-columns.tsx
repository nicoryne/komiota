import { ColumnDef } from '@/components/dashboard/data-table';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { BusStop } from '@/services/bus-stop';
import Link from 'next/link';

export function getBusStopColumns(): ColumnDef<BusStop>[] {
  return [
    {
      header: 'Name',
      cell: (row) => (
        <Link
          href={`/dashboard/bus-stops/${row.id}`}
          className="text-plum-builder hover:underline font-medium"
        >
          {row.name}
        </Link>
      ),
    },
    {
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status as 'pending' | 'approved' | 'rejected'} />,
    },
    {
      header: 'Created',
      cell: (row) =>
        row.created_at ? new Date(row.created_at).toLocaleDateString() : '—',
    },
  ];
}
