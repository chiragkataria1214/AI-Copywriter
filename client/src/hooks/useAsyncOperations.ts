import { useState, useCallback, useRef, useEffect } from 'react';

// Enhanced async state management with better error handling and loading states
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
}

export const useAsyncOperation = <T, Args extends any[]>(
  asyncFunction: (...args: Args) => Promise<T>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    retryAttempts?: number;
    retryDelay?: number;
  } = {}
) => {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: null
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);

  const execute = useCallback(async (...args: Args) => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    setState(prev => ({
      ...prev,
      loading: true,
      error: null
    }));

    const attemptOperation = async (attempt: number = 0): Promise<void> => {
      try {
        const result = await asyncFunction(...args);
        
        // Check if operation was aborted
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        setState({
          data: result,
          loading: false,
          error: null,
          lastUpdated: new Date()
        });

        retryCountRef.current = 0;
        options.onSuccess?.(result);
      } catch (error) {
        // Check if operation was aborted
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        const errorObj = error instanceof Error ? error : new Error(String(error));
        
        // Retry logic
        const maxRetries = options.retryAttempts || 0;
        if (attempt < maxRetries) {
          const delay = options.retryDelay || 1000;
          setTimeout(() => {
            attemptOperation(attempt + 1);
          }, delay * Math.pow(2, attempt)); // Exponential backoff
          return;
        }

        setState(prev => ({
          ...prev,
          loading: false,
          error: errorObj
        }));

        retryCountRef.current = 0;
        options.onError?.(errorObj);
      }
    };

    await attemptOperation();
  }, [asyncFunction, options]);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setState(prev => ({
        ...prev,
        loading: false
      }));
    }
  }, []);

  const reset = useCallback(() => {
    cancel();
    setState({
      data: null,
      loading: false,
      error: null,
      lastUpdated: null
    });
  }, [cancel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    execute,
    cancel,
    reset,
    isStale: state.lastUpdated ? Date.now() - state.lastUpdated.getTime() > 300000 : true // 5 minutes
  };
};

// Hook for managing multiple async operations with loading states
export const useAsyncOperationsManager = () => {
  const [operations, setOperations] = useState<Record<string, AsyncState<any>>>({});

  const registerOperation = useCallback(<T>(
    key: string, 
    asyncFunction: (...args: any[]) => Promise<T>,
    options?: Parameters<typeof useAsyncOperation>[1]
  ) => {
    const operation = useAsyncOperation(asyncFunction, options);
    
    setOperations(prev => ({
      ...prev,
      [key]: operation
    }));

    return operation;
  }, []);

  const getOperation = useCallback((key: string) => {
    return operations[key];
  }, [operations]);

  const isAnyLoading = useCallback(() => {
    return Object.values(operations).some(op => op.loading);
  }, [operations]);

  const hasAnyErrors = useCallback(() => {
    return Object.values(operations).some(op => op.error);
  }, [operations]);

  const cancelAll = useCallback(() => {
    Object.values(operations).forEach(op => {
      if ('cancel' in op && typeof op.cancel === 'function') {
        op.cancel();
      }
    });
  }, [operations]);

  return {
    registerOperation,
    getOperation,
    isAnyLoading,
    hasAnyErrors,
    cancelAll,
    operations
  };
};

// Hook for debounced async operations (useful for search, auto-save, etc.)
export const useDebouncedAsyncOperation = <T, Args extends any[]>(
  asyncFunction: (...args: Args) => Promise<T>,
  delay: number = 300,
  options?: Parameters<typeof useAsyncOperation>[1]
) => {
  const operation = useAsyncOperation(asyncFunction, options);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedExecute = useCallback((...args: Args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      operation.execute(...args);
    }, delay);
  }, [operation.execute, delay]);

  const cancelDebounce = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ...operation,
    debouncedExecute,
    cancelDebounce
  };
};

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