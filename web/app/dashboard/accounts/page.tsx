import { AccountService } from '@/services/account';
import { DataTable, ColumnDef } from '@/components/dashboard/data-table';
import { SearchInput } from '@/components/dashboard/search-input';
import Link from 'next/link';

type ProfileRow = {
  id: string;
  username: string | null;
  role: string | null;
  commuter_score: number | null;
  total_trips: number | null;
  rank_tier: string | null;
  created_at: string | null;
};

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string };
}) {
  const page = parseInt(searchParams.page || '1', 10);
  const search = searchParams.search || '';

  const result = await AccountService.list({
    page,
    pageSize: 20,
    searchQuery: search,
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  const accounts = result.success ? result.data.data : [];
  const totalCount = result.success ? result.data.totalCount : 0;
  const currentPage = result.success ? result.data.currentPage : 1;

  const columns: ColumnDef<ProfileRow>[] = [
    {
      header: 'Username',
      cell: (row) => (
        <Link
          href={`/dashboard/accounts/${row.id}`}
          className="text-[#4627b6] hover:underline font-medium"
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
    {
      header: 'Joined',
      cell: (row) =>
        row.created_at ? new Date(row.created_at).toLocaleDateString() : '—',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1C1A22]">Accounts</h1>
        <p className="text-gray-600 mt-1">Manage user accounts</p>
      </div>

      <SearchInput placeholder="Search by username..." />

      <DataTable
        data={accounts}
        columns={columns}
        totalCount={totalCount}
        currentPage={currentPage}
        pageSize={20}
      />
    </div>
  );
}
