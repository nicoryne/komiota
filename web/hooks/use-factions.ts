'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTable } from './use-table';
import { FactionService, type FactionWithMemberCount } from '@/services/faction';
import { createFaction, updateFaction, deleteFaction } from '@/actions/faction';
import { toast } from '@/lib/toast';

export function useFactions() {
  const tableOps = useTable({
    initialSortBy: 'name',
    initialSortOrder: 'asc',
  });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['factions'],
    queryFn: async () => {
      const result = await FactionService.list();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createFaction,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Faction created successfully');
        queryClient.invalidateQueries({ queryKey: ['factions'] });
      } else {
        toast.error(result.error || 'Failed to create faction');
      }
    },
    onError: () => {
      toast.error('Failed to create faction');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateFaction(id, data),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Faction updated successfully');
        queryClient.invalidateQueries({ queryKey: ['factions'] });
      } else {
        toast.error(result.error || 'Failed to update faction');
      }
    },
    onError: () => {
      toast.error('Failed to update faction');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFaction,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Faction deleted successfully');
        queryClient.invalidateQueries({ queryKey: ['factions'] });
      } else {
        toast.error(result.error || 'Failed to delete faction');
      }
    },
    onError: () => {
      toast.error('Failed to delete faction');
    },
  });

  return {
    ...tableOps,
    data: data || [],
    totalCount: data?.length || 0,
    loading: isLoading,
    isFetching,
    createFaction: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateFaction: (id: string, data: any) => updateMutation.mutate({ id, data }),
    isUpdating: updateMutation.isPending,
    deleteFaction: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
