import { AccountService } from '@/services/account';
import { AccountsClient } from './accounts-client';

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
    sortBy: 'username',
    sortOrder: 'asc',
  });

  const accounts = result.success ? result.data.data : [];
  const totalCount = result.success ? result.data.totalCount : 0;
  const currentPage = result.success ? result.data.currentPage : 1;

  return <AccountsClient accounts={accounts} totalCount={totalCount} currentPage={currentPage} />;
}
