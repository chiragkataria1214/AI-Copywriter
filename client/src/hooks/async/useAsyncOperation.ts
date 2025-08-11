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