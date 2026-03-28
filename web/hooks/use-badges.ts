'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTable } from './use-table';
import { BadgeService, type BadgeWithAwardCount } from '@/services/badge';
import { createBadge, updateBadge, deleteBadge } from '@/actions/badge';
import { toast } from '@/lib/toast';

export function useBadges() {
  const tableOps = useTable({
    initialSortBy: 'name',
    initialSortOrder: 'asc',
  });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['badges'],
    queryFn: async () => {
      const result = await BadgeService.list();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createBadge,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Badge created successfully');
        queryClient.invalidateQueries({ queryKey: ['badges'] });
      } else {
        toast.error(result.error || 'Failed to create badge');
      }
    },
    onError: () => {
      toast.error('Failed to create badge');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateBadge(id, data),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Badge updated successfully');
        queryClient.invalidateQueries({ queryKey: ['badges'] });
      } else {
        toast.error(result.error || 'Failed to update badge');
      }
    },
    onError: () => {
      toast.error('Failed to update badge');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBadge,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Badge deleted successfully');
        queryClient.invalidateQueries({ queryKey: ['badges'] });
      } else {
        toast.error(result.error || 'Failed to delete badge');
      }
    },
    onError: () => {
      toast.error('Failed to delete badge');
    },
  });

  return {
    ...tableOps,
    data: data || [],
    totalCount: data?.length || 0,
    loading: isLoading,
    isFetching,
    createBadge: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateBadge: (id: string, data: any) => updateMutation.mutate({ id, data }),
    isUpdating: updateMutation.isPending,
    deleteBadge: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
