import { BusStopService } from '@/services/bus-stop';
import { AuthService } from '@/services/auth';
import { BusStopsClient } from './bus-stops-client';

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

  return (
    <BusStopsClient
      busStops={busStops}
      totalCount={totalCount}
      currentPage={currentPage}
      userRole={userRole}
      currentStatus={status}
      currentSearch={search}
    />
  );
}
