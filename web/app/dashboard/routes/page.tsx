import { RouteService } from '@/services/route';
import { AuthService } from '@/services/auth';
import { RoutesClient } from './routes-client';

export default async function RoutesPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string };
}) {
  const authResult = await AuthService.checkAuth(['admin']);

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

  return <RoutesClient routes={routes} totalCount={totalCount} currentPage={currentPage} />;
}
