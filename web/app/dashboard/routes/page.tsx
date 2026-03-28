import { RouteService } from '@/services/route';
import { AuthService } from '@/services/auth';
import { DataTable, ColumnDef } from '@/components/dashboard/data-table';
import { SearchInput } from '@/components/dashboard/search-input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

type RouteRow = {
  id: string;
  name: string;
  description: string | null;
  point_multiplier: number | null;
  stop_count: number;
  created_at: string | null;
};

export default async function RoutesPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string };
}) {
  const authResult = await AuthService.checkAuth(['admin']);
  const userRole = authResult.userRole as 'admin';

  const page = parseInt(searchParams.page || '1', 10);
  const search = searchParams.search || '';

  const result = await RouteService.list({
    page,
    pageSize: 20,
    searchQuery: search,
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  const routes = result.success ? result.data.data : [];
  const totalCount = result.success ? result.data.totalCount : 0;
  const currentPage = result.success ? result.data.currentPage : 1;

  const columns: ColumnDef<RouteRow>[] = [
    {
      header: 'Name',
      cell: (row) => (
        <Link
          href={`/dashboard/routes/${row.id}`}
          className="text-[#4627b6] hover:underline font-medium"
        >
          {row.name}
        </Link>
      ),
    },
    {
      header: 'Description',
      cell: (row) => (
        <span className="text-gray-600">{row.description || '—'}</span>
      ),
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1C1A22]">Routes</h1>
          <p className="text-gray-600 mt-1">Manage transit routes</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/routes/new">
            <Plus className="w-4 h-4" />
            Create Route
          </Link>
        </Button>
      </div>

      <SearchInput placeholder="Search routes..." />

      <DataTable
        data={routes}
        columns={columns}
        totalCount={totalCount}
        currentPage={currentPage}
        pageSize={20}
      />
    </div>
  );
}
