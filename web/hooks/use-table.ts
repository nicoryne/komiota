import { useState, useMemo } from 'react';

export type SortOrder = 'asc' | 'desc';

export interface TableState {
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: SortOrder;
  search: string;
  filters: Record<string, any>;
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: SortOrder;
  searchQuery?: string;
  filters?: Record<string, any>;
}

export interface UseTableOptions {
  initialPage?: number;
  initialPageSize?: number;
  initialSortBy?: string;
  initialSortOrder?: SortOrder;
}

export function useTable<T>({
  initialPage = 1,
  initialPageSize = 20,
  initialSortBy = 'created_at',
  initialSortOrder = 'desc',
}: UseTableOptions = {}) {
  const [tableState, setTableState] = useState<TableState>({
    page: initialPage,
    pageSize: initialPageSize,
    sortBy: initialSortBy,
    sortOrder: initialSortOrder,
    search: '',
    filters: {},
  });

  const paginationOptions = useMemo<PaginationOptions>(
    () => ({
      page: tableState.page,
      pageSize: tableState.pageSize,
      sortBy: tableState.sortBy,
      sortOrder: tableState.sortOrder,
      searchQuery: tableState.search || undefined,
      filters: Object.keys(tableState.filters).length > 0 ? tableState.filters : undefined,
    }),
    [tableState]
  );

  const setPage = (page: number) => {
    setTableState((prev) => ({ ...prev, page }));
  };

  const setPageSize = (pageSize: number) => {
    setTableState((prev) => ({ ...prev, pageSize, page: 1 }));
  };

  const setSortBy = (sortBy: string, sortOrder?: SortOrder) => {
    setTableState((prev) => ({
      ...prev,
      sortBy,
      sortOrder: sortOrder || (prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc'),
    }));
  };

  const setSearch = (search: string) => {
    setTableState((prev) => ({ ...prev, search, page: 1 }));
  };

  const setFilters = (filters: Record<string, any>) => {
    setTableState((prev) => ({ ...prev, filters, page: 1 }));
  };

  return {
    tableState,
    paginationOptions,
    setPage,
    setPageSize,
    setSortBy,
    setSearch,
    setFilters,
  };
}
