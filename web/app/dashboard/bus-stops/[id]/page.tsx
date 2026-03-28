import { BusStopService } from '@/services/bus-stop';
import { AuthService } from '@/services/auth';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { ConfirmDialog } from '@/components/dashboard/confirm-dialog';
import { BusStopActions } from './bus-stop-actions';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { deleteBusStop } from '@/actions/bus-stop';

export default async function BusStopDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const authResult = await AuthService.checkAuth(['admin', 'moderator']);
  const userRole = authResult.userRole as 'admin' | 'moderator';

  const result = await BusStopService.getById(params.id);

  if (!result.success) {
    notFound();
  }

  const busStop = result.data;

  async function handleDelete() {
    'use server';
    await deleteBusStop(params.id);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/bus-stops">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-[#1C1A22]">{busStop.name}</h1>
          <p className="text-gray-600 mt-1">Bus stop details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 bg-white rounded-[16px] border border-gray-200 p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-[#1C1A22] mb-4">
              Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Name</label>
                <p className="text-[#1C1A22] mt-1">{busStop.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <div className="mt-1">
                  <StatusBadge status={busStop.status} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Created
                </label>
                <p className="text-[#1C1A22] mt-1">
                  {busStop.created_at
                    ? new Date(busStop.created_at).toLocaleString()
                    : '—'}
                </p>
              </div>
              {busStop.creator && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Submitted by
                  </label>
                  <p className="text-[#1C1A22] mt-1">
                    {busStop.creator.username || 'Unknown'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {busStop.image_url && (
            <div>
              <h2 className="text-lg font-semibold text-[#1C1A22] mb-4">Image</h2>
              <img
                src={busStop.image_url}
                alt={busStop.name}
                className="w-full max-w-md rounded-[12px] border border-gray-200"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white rounded-[16px] border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-[#1C1A22] mb-4">Actions</h2>
          <div className="space-y-3">
            {busStop.status === 'pending' && (
              <BusStopActions busStopId={params.id} />
            )}

            {userRole === 'admin' && (
              <>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/dashboard/bus-stops/${params.id}/edit`}>
                    Edit
                  </Link>
                </Button>

                <ConfirmDialog
                  trigger={
                    <Button variant="destructive" className="w-full">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  }
                  title="Delete Bus Stop"
                  description="Are you sure you want to delete this bus stop? This action cannot be undone."
                  confirmLabel="Delete"
                  onConfirm={handleDelete}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
