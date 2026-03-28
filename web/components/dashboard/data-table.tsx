'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ColumnDef<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

export interface TableAction<T> {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  variant?: 'default' | 'destructive' | 'outline';
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  actions?: TableAction<T>[];
  addButton?: {
    label: string;
    onClick: () => void;
  };
  onPageChange?: (page: number) => void;
}

export function DataTable<T>({
  data,
  columns,
  totalCount,
  currentPage,
  pageSize,
  actions,
  addButton,
  onPageChange,
}: DataTableProps<T>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageCount = Math.ceil(totalCount / pageSize);

  const handlePageChange = (newPage: number) => {
    if (onPageChange) {
      onPageChange(newPage);
    } else {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', newPage.toString());
      router.push(`?${params.toString()}`);
    }
  };

  const hasActions = actions && actions.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {addButton && (
        <div className="flex justify-end">
          <Button onClick={addButton.onClick}>{addButton.label}</Button>
        </div>
      )}
      <div className="border border-gray-200 rounded-[12px] overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#FAFAFA] border-b border-gray-200">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${column.className || ''}`}
                  >
                    {column.header}
                  </th>
                ))}
                {hasActions && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (hasActions ? 1 : 0)}
                    className="px-6 py-8 text-center text-sm text-gray-500"
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                data.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {columns.map((column, colIndex) => (
                      <td
                        key={colIndex}
                        className={`px-6 py-4 text-sm text-[#1C1A22] ${column.className || ''}`}
                      >
                        {column.cell
                          ? column.cell(row)
                          : column.accessorKey
                            ? String(row[column.accessorKey] ?? '')
                            : ''}
                      </td>
                    ))}
                    {hasActions && (
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          {actions.map((action) => (
                            <Button
                              key={action.key}
                              size="sm"
                              variant={action.variant || 'outline'}
                              onClick={() => action.onClick(row)}
                            >
                              {action.icon}
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, totalCount)} of {totalCount}{' '}
            results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(pageCount, 5) }, (_, i) => {
                let pageNum: number;
                if (pageCount <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= pageCount - 2) {
                  pageNum = pageCount - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className="min-w-[36px]"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pageCount}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
