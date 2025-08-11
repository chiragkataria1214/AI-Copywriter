import { useRef, useCallback, useEffect } from 'react';
import { useAsyncOperation } from '@/hooks/async/useAsyncOperation';

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