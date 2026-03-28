import { BusStopService } from '@/services/bus-stop';
import { AuthService } from '@/services/auth';
import { DataTable, ColumnDef } from '@/components/dashboard/data-table';
import { SearchInput } from '@/components/dashboard/search-input';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

type BusStop = {
  id: string;
  name: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string | null;
};

const statusTabs = [
  { label: 'All', value: undefined },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

export default async function BusStopsPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string; page?: string };
}) {
  const authResult = await AuthService.checkAuth(['admin', 'moderator']);
  const userRole = authResult.userRole as 'admin' | 'moderator';

  const page = parseInt(searchParams.page || '1', 10);
  const search = searchParams.search || '';
  const status = searchParams.status;

  const result = await BusStopService.list({
    page,
    pageSize: 20,
    searchQuery: search,
    filters: status ? { status } : undefined,
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  const busStops = result.success ? result.data.data : [];
  const totalCount = result.success ? result.data.totalCount : 0;
  const currentPage = result.success ? result.data.currentPage : 1;

  const columns: ColumnDef<BusStop>[] = [
    {
      header: 'Name',
      cell: (row) => (
        <Link
          href={`/dashboard/bus-stops/${row.id}`}
          className="text-[#4627b6] hover:underline font-medium"
        >
          {row.name}
        </Link>
      ),
    },
    {
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Created',
      cell: (row) =>
        row.created_at ? new Date(row.created_at).toLocaleDateString() : '—',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1C1A22]">Bus Stops</h1>
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

      {/* Search */}
      <SearchInput placeholder="Search bus stops..." />

      {/* Status Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {statusTabs.map((tab) => {
          const isActive = tab.value === status || (!tab.value && !status);
          const href = tab.value
            ? `?status=${tab.value}${search ? `&search=${search}` : ''}`
            : search
              ? `?search=${search}`
              : '/dashboard/bus-stops';

          return (
            <Link
              key={tab.label}
              href={href}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-[#4627b6] text-[#4627b6]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Table */}
      <DataTable
        data={busStops}
        columns={columns}
        totalCount={totalCount}
        currentPage={currentPage}
        pageSize={20}
      />
    </div>
  );
}
