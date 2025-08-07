import React, { createContext, useContext, useMemo } from 'react';
import { useConfigurationData } from '@/hooks/useConfigurationData';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { useGenerationValidation } from '@/hooks/useGenerationValidation';
import { useTrainingConfiguration } from '@/hooks/useTrainingConfiguration';
import { getBrandDrLabel, getWordCount } from '@/utils/brandUtils';

interface MetaAdGeneratorContextType {
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

const MetaAdGeneratorContext = createContext<MetaAdGeneratorContextType | undefined>(undefined);

export const useMetaAdGeneratorContext = () => {
  const context = useContext(MetaAdGeneratorContext);
  if (context === undefined) {
    throw new Error('useMetaAdGeneratorContext must be used within a MetaAdGeneratorProvider');
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
    <MetaAdGeneratorContext.Provider value={contextValue}>
      {children}
    </MetaAdGeneratorContext.Provider>
  );
};