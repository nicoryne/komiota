'use client';

import { DataTable } from '@/components/dashboard/data-table';
import { SearchInput } from '@/components/dashboard/search-input';
import { getRouteColumns } from '@/components/dashboard/routes/route-columns';
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

interface RoutesClientProps {
  routes: RouteRow[];
  totalCount: number;
  currentPage: number;
}

export function RoutesClient({ routes, totalCount, currentPage }: RoutesClientProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-deep-amethyst">Routes</h1>
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
        columns={getRouteColumns()}
        totalCount={totalCount}
        currentPage={currentPage}
        pageSize={20}
      />
    </div>
  );
}
