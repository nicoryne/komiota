'use client';

import { useOptimistic, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { updateBusStopStatus } from '@/actions/bus-stop';
import { useRouter } from 'next/navigation';

interface BusStopActionsProps {
  busStopId: string;
}

export function BusStopActions({ busStopId }: BusStopActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticStatus, setOptimisticStatus] = useOptimistic<
    'pending' | 'approved' | 'rejected' | null
  >(null);

  const handleStatusUpdate = async (status: 'approved' | 'rejected') => {
    startTransition(async () => {
      setOptimisticStatus(status);
      const result = await updateBusStopStatus(busStopId, status);
      if (result.success) {
        router.refresh();
      }
    });
  };

  if (optimisticStatus) {
    return (
      <div className="text-center py-4 text-sm text-gray-600">
        Updating status...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={() => handleStatusUpdate('approved')}
        disabled={isPending}
        className="w-full bg-green-600 hover:bg-green-700"
      >
        <Check className="w-4 h-4" />
        Approve
      </Button>
      <Button
        onClick={() => handleStatusUpdate('rejected')}
        disabled={isPending}
        variant="destructive"
        className="w-full"
      >
        <X className="w-4 h-4" />
        Reject
      </Button>
    </div>
  );
}
