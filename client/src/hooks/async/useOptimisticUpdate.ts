import { useState, useCallback } from 'react';

// Hook for optimistic updates with rollback capability
export const useOptimisticUpdate = <T>(
  initialData: T,
  asyncUpdate: (data: T) => Promise<T>
) => {
  const [data, setData] = useState<T>(initialData);
  const [previousData, setPreviousData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const optimisticUpdate = useCallback(async (newData: T) => {
    // Store current data for potential rollback
    setPreviousData(data);
    
    // Optimistically update the UI
    setData(newData);
    setLoading(true);
    setError(null);

    try {
      const result = await asyncUpdate(newData);
      setData(result);
      setPreviousData(null);
    } catch (err) {
      // Rollback to previous data
      setData(previousData || data);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [data, previousData, asyncUpdate]);

  const rollback = useCallback(() => {
    if (previousData !== null) {
      setData(previousData);
      setPreviousData(null);
      setError(null);
    }
  }, [previousData]);

  return {
    data,
    loading,
    error,
    optimisticUpdate,
    rollback,
    canRollback: previousData !== null
  };
};