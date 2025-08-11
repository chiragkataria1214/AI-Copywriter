import { useCallback, useMemo } from 'react';
import { useOptimizedState } from '@/hooks/state/useOptimizedState';

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