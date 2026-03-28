import { ColumnDef } from '@/components/dashboard/data-table';
import { Profile } from '@/services/account';
import Link from 'next/link';

export function getAccountColumns(): ColumnDef<Profile>[] {
  return [
    {
      header: 'Username',
      cell: (row) => (
        <Link
          href={`/dashboard/accounts/${row.id}`}
          className="text-plum-builder hover:underline font-medium"
        >
          {row.username || 'Unknown'}
        </Link>
      ),
    },
    {
      header: 'Role',
      cell: (row) => (
        <span className="capitalize text-gray-700">{row.role || 'user'}</span>
      ),
    },
    {
      header: 'Commuter Score',
      cell: (row) => row.commuter_score?.toLocaleString() || '0',
    },
    {
      header: 'Total Trips',
      cell: (row) => row.total_trips?.toLocaleString() || '0',
    },
    {
      header: 'Rank Tier',
      cell: (row) => row.rank_tier || '—',
    },
  ];
}
