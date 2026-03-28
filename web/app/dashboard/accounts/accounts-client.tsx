'use client';

import { DataTable } from '@/components/dashboard/data-table';
import { SearchInput } from '@/components/dashboard/search-input';
import { getAccountColumns } from '@/components/dashboard/accounts/account-columns';
import { Profile } from '@/services/account';

interface AccountsClientProps {
  accounts: Profile[];
  totalCount: number;
  currentPage: number;
}

export function AccountsClient({ accounts, totalCount, currentPage }: AccountsClientProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-deep-amethyst">Accounts</h1>
        <p className="text-gray-600 mt-1">Manage user accounts</p>
      </div>

      <SearchInput placeholder="Search by username..." />

      <DataTable
        data={accounts}
        columns={getAccountColumns()}
        totalCount={totalCount}
        currentPage={currentPage}
        pageSize={20}
      />
    </div>
  );
}
