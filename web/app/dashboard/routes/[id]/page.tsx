import { RouteService } from '@/services/route';
import { ConfirmDialog } from '@/components/dashboard/confirm-dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { deleteRoute } from '@/actions/route';

export default async function RouteDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const result = await RouteService.getById(params.id);

  if (!result.success) {
    notFound();
  }

  const route = result.data;

  async function handleDelete() {
    'use server';
    await deleteRoute(params.id);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/routes">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-[#1C1A22]">{route.name}</h1>
          <p className="text-gray-600 mt-1">Route details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[16px] border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-[#1C1A22] mb-4">
              Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Name</label>
                <p className="text-[#1C1A22] mt-1">{route.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Description
                </label>
                <p className="text-[#1C1A22] mt-1">
                  {route.description || '—'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Point Multiplier
                </label>
                <p className="text-[#1C1A22] mt-1">
                  {route.point_multiplier?.toFixed(1) || '1.0'}
                </p>
              </div>
            </div>
          </div>

          {/* Stops */}
          <div className="bg-white rounded-[16px] border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#1C1A22]">
                Route Stops ({route.stops?.length || 0})
              </h2>
              <Button size="sm" asChild>
                <Link href={`/dashboard/routes/${params.id}/stops`}>
                  Manage Stops
                </Link>
              </Button>
            </div>

            {!route.stops || route.stops.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No stops added to this route yet.
              </div>
            ) : (
              <div className="space-y-2">
                {route.stops.map((routeStop, index) => (
                  <div
                    key={routeStop.id}
                    className="flex items-center gap-3 p-3 bg-[#FAFAFA] rounded-[12px]"
                  >
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#4627b6] text-white text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="text-[#1C1A22]">
                      {routeStop.stop?.name || 'Unknown Stop'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-[16px] border border-gray-200 p-6 h-fit">
          <h2 className="text-lg font-semibold text-[#1C1A22] mb-4">Actions</h2>
          <div className="space-y-3">
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/dashboard/routes/${params.id}/edit`}>Edit</Link>
            </Button>

            <ConfirmDialog
              trigger={
                <Button variant="destructive" className="w-full">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              }
              title="Delete Route"
              description="Are you sure you want to delete this route? This will also remove all associated stops. This action cannot be undone."
              confirmLabel="Delete"
              onConfirm={handleDelete}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
