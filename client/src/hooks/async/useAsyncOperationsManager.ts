import { useState, useCallback } from 'react';
import { useAsyncOperation, AsyncState } from '@/hooks/async/useAsyncOperation';

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