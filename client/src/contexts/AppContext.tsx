import React, { createContext, useContext, useMemo } from 'react';
import { useConfigurationData } from '@/hooks/config/useConfigurationData';
import { useAdminAccess } from '@/hooks/admin/useAdminAccess';
import { useGenerationValidation } from '@/hooks/generation/useGenerationValidation';
import { useTrainingConfiguration } from '@/hooks/config/useConfigurationMutations';
import { getBrandDrLabel, getWordCount } from '@/utils/brandUtils';
import { ERROR_MESSAGES } from '@/utils/errorMessages';

interface AppContextType {
  // Configuration data
  configData: ReturnType<typeof useConfigurationData>;
  
  // Admin access
  adminAccess: ReturnType<typeof useAdminAccess>;
  
  // Generation validation
  validation: ReturnType<typeof useGenerationValidation>;
  
  // Training configuration
  trainingConfig: ReturnType<typeof useTrainingConfiguration>;
  
  // Utility functions
  getBrandDrLabel: (brandDrBalance: number[]) => string;
  getWordCount: (text: string) => number;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error(ERROR_MESSAGES.CONTEXT.PROVIDER_MISSING('AppContext'));
  }
  return context;
};

export const MetaAdGeneratorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize hooks
  const configData = useConfigurationData();
  const adminAccess = useAdminAccess();
  const validation = useGenerationValidation({
    modelSettings: configData.modelSettings,
    stationPrompts: configData.stationPrompts
  });
  const trainingConfig = useTrainingConfiguration();

  // Utility functions are imported from utils/brandUtils.ts

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    configData,
    adminAccess,
    validation,
    trainingConfig,
    getBrandDrLabel,
    getWordCount
  }), [
    configData,
    adminAccess,
    validation,
    trainingConfig,
    getBrandDrLabel,
    getWordCount
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};