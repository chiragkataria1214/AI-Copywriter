import { useCallback, useMemo } from 'react';
import { useOptimizedState } from '@/hooks/state/useOptimizedState';

// Specialized hook for form state management
export const useFormState = <T extends Record<string, any>>(initialState: T) => {
  const { state, updateState, updateMultipleState, resetState } = useOptimizedState(initialState);

  // Handle form input changes
  const handleInputChange = useCallback(<K extends keyof T>(key: K) => {
    return (value: T[K]) => {
      updateState(key, value);
    };
  }, [updateState]);

  // Handle multiple form changes at once
  const handleFormChange = useCallback((changes: Partial<T>) => {
    updateMultipleState(changes);
  }, [updateMultipleState]);

  // Validate form state
  const validateForm = useCallback((validators: Partial<Record<keyof T, (value: any) => boolean>>) => {
    const errors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    for (const [key, validator] of Object.entries(validators) as [keyof T, (value: any) => boolean][]) {
      if (!validator(state[key])) {
        errors[key] = `Invalid ${String(key)}`;
        isValid = false;
      }
    }

    return { isValid, errors };
  }, [state]);

  return useMemo(() => ({
    formState: state,
    handleInputChange,
    handleFormChange,
    resetForm: resetState,
    validateForm
  }), [state, handleInputChange, handleFormChange, resetState, validateForm]);
};