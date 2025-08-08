import { useState, useCallback, useMemo } from 'react';

// Custom hook for optimized state management with selective updates
export const useOptimizedState = <T extends Record<string, any>>(initialState: T) => {
  const [state, setState] = useState<T>(initialState);

  // Optimized setter that only updates if the value actually changed
  const updateState = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setState(prevState => {
      if (prevState[key] === value) {
        return prevState; // No change, return same reference
      }
      return {
        ...prevState,
        [key]: value
      };
    });
  }, []);

  // Batch update multiple state values
  const updateMultipleState = useCallback((updates: Partial<T>) => {
    setState(prevState => {
      let hasChanges = false;
      const newState = { ...prevState };
      
      for (const [key, value] of Object.entries(updates)) {
        if (prevState[key as keyof T] !== value) {
          newState[key as keyof T] = value;
          hasChanges = true;
        }
      }
      
      return hasChanges ? newState : prevState;
    });
  }, []);

  // Reset state to initial values
  const resetState = useCallback(() => {
    setState(initialState);
  }, [initialState]);

  // Get a specific state value (memoized for performance)
  const getStateValue = useCallback(<K extends keyof T>(key: K): T[K] => {
    return state[key];
  }, [state]);

  return useMemo(() => ({
    state,
    updateState,
    updateMultipleState,
    resetState,
    getStateValue
  }), [state, updateState, updateMultipleState, resetState, getStateValue]);
};

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

// Hook for managing UI state separately from business logic
export const useUIState = () => {
  const initialUIState = {
    activeTab: 'paid-social',
    paidSocialSubTab: 'ad-copy',
    productLaunchSubTab: 'brief-creation',
    organicSocialType: 'captions',
    showGenerationDetails: false,
    showRevisionPanel: false,
    showAdminKeyPrompt: false,
    copiedStates: {
      headlines: false,
      primaryText: false,
      landingCopy: false,
      static: false,
      retention: false
    }
  };

  const { state, updateState, updateMultipleState } = useOptimizedState(initialUIState);

  // Specialized methods for UI state
  const setActiveTab = useCallback((tab: string) => {
    updateState('activeTab', tab);
  }, [updateState]);

  const setCopiedState = useCallback((type: keyof typeof initialUIState.copiedStates, value: boolean) => {
    updateState('copiedStates', {
      ...state.copiedStates,
      [type]: value
    });
  }, [updateState, state.copiedStates]);

  // Auto-reset copied states after 2 seconds
  const setCopiedWithTimeout = useCallback((type: keyof typeof initialUIState.copiedStates) => {
    setCopiedState(type, true);
    setTimeout(() => {
      setCopiedState(type, false);
    }, 2000);
  }, [setCopiedState]);

  return useMemo(() => ({
    uiState: state,
    setActiveTab,
    setPaidSocialSubTab: (tab: string) => updateState('paidSocialSubTab', tab),
    setProductLaunchSubTab: (tab: string) => updateState('productLaunchSubTab', tab),
    setOrganicSocialType: (type: string) => updateState('organicSocialType', type),
    setShowGenerationDetails: (show: boolean) => updateState('showGenerationDetails', show),
    setShowRevisionPanel: (show: boolean) => updateState('showRevisionPanel', show),
    setShowAdminKeyPrompt: (show: boolean) => updateState('showAdminKeyPrompt', show),
    setCopiedWithTimeout,
    updateUIState: updateMultipleState
  }), [state, updateState, updateMultipleState, setActiveTab, setCopiedWithTimeout]);
};