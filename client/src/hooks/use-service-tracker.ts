import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { ServiceHours, InsertServiceHours } from '@shared/schema';

export const useServiceTracker = (userId: number) => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Fetch service hours for a user
  const { 
    data: serviceHours = [], 
    isLoading,
    isError,
    error: fetchError
  } = useQuery({
    queryKey: [`/api/service-hours/${userId}`],
    enabled: !!userId
  });

  // Add a new service hour entry
  const addServiceHourMutation = useMutation({
    mutationFn: async (data: Omit<InsertServiceHours, 'userId'> & { userId: number }) => {
      const response = await apiRequest('POST', '/api/service-hours', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/service-hours/${userId}`] });
      setError(null);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to add service hours');
    }
  });

  // Delete a service hour entry
  const deleteServiceHourMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/service-hours/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/service-hours/${userId}`] });
      setError(null);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to delete service hours');
    }
  });

  // Set error message if query fails
  useEffect(() => {
    if (isError && fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to fetch service hours');
    }
  }, [isError, fetchError]);

  // Helper function to add service hours
  const addServiceHour = async (data: Omit<InsertServiceHours, 'userId'> & { userId: number }) => {
    return addServiceHourMutation.mutateAsync(data);
  };

  // Helper function to delete service hours
  const deleteServiceHour = async (id: number) => {
    return deleteServiceHourMutation.mutateAsync(id);
  };

  return {
    serviceHours: serviceHours as ServiceHours[],
    isLoading,
    isError,
    error,
    addServiceHour,
    deleteServiceHour,
    isAdding: addServiceHourMutation.isPending,
    isDeleting: deleteServiceHourMutation.isPending
  };
};
