import { ColumnDef } from '@/components/dashboard/data-table';
import Link from 'next/link';

type RouteRow = {
  id: string;
  name: string;
  description: string | null;
  point_multiplier: number | null;
  stop_count: number;
  created_at: string | null;
};

export function getRouteColumns(): ColumnDef<RouteRow>[] {
  return [
    {
      header: 'Name',
      cell: (row) => (
        <Link
          href={`/dashboard/routes/${row.id}`}
          className="text-plum-builder hover:underline font-medium"
        >
          {row.name}
        </Link>
      ),
    },
    {
      header: 'Description',
      cell: (row) => <span className="text-gray-600">{row.description || '—'}</span>,
    },
    {
      header: 'Point Multiplier',
      cell: (row) => row.point_multiplier?.toFixed(1) || '1.0',
    },
    {
      header: 'Stops',
      cell: (row) => row.stop_count,
    },
    {
      header: 'Created',
      cell: (row) =>
        row.created_at ? new Date(row.created_at).toLocaleDateString() : '—',
    },
  ];
}
