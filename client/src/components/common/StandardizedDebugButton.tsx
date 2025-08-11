import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { useDebugInfo, StationKey } from '@/hooks/generation/useDebugInfo';
import { debugInfoToGenerationMetadata, createFallbackGenerationMetadata } from '@/utils/debugHelpers';
import { GenerationMetadata } from '@/components/main/shared/types';

interface StandardizedDebugButtonProps {
  stationKey: StationKey;
  stationName: string;
  fallbackPrompts?: {
    systemPrompt?: string;
    userPrompt?: string;
  };
  modelSettings?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
  setCurrentGenerationMetadata: (metadata: GenerationMetadata) => void;
  setShowGenerationDetails: (show: boolean) => void;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "lg" | "default" | "icon";
  debugInfoManager?: {
    getDebugInfo: (stationKey: string) => any;
    setDebugInfo: (stationKey: string, debugInfo: any) => void;
  };
}

/**
 * Standardized debug button component that works consistently across all stations
 * Automatically handles debug info retrieval and metadata conversion
 */
export const StandardizedDebugButton: React.FC<StandardizedDebugButtonProps> = ({
  stationKey,
  stationName,
  fallbackPrompts = {},
  modelSettings,
  setCurrentGenerationMetadata,
  setShowGenerationDetails,
  disabled = false,
  className = "flex items-center space-x-1 text-xs",
  size = "sm",
  debugInfoManager
}) => {
  const fallbackDebugInfo = useDebugInfo();

  const handleClick = () => {
    // Use passed debugInfoManager if available, otherwise fallback to hook
    const getDebugInfo = debugInfoManager?.getDebugInfo || fallbackDebugInfo.getDebugInfo;
    const debugInfo = getDebugInfo(stationKey);
    
    let metadata: GenerationMetadata;
    
    if (debugInfo) {
      // Use actual debug info if available
      metadata = debugInfoToGenerationMetadata(debugInfo);
    } else {
      // Create fallback metadata
      metadata = createFallbackGenerationMetadata(
        stationName,
        fallbackPrompts,
        modelSettings
      );
    }
    
    setCurrentGenerationMetadata(metadata);
    setShowGenerationDetails(true);
  };

  return (
    <Button
      variant="outline"
      size={size}
      onClick={handleClick}
      disabled={disabled}
      className={className}
    >
      <Eye size={12} className="mr-1" />
      <span>Details</span>
    </Button>
  );
};

/**
 * Hook to create standardized debug button props
 * Simplifies usage in existing components
 */
export const useStandardizedDebugButton = (
  stationKey: StationKey,
  stationName: string,
  setCurrentGenerationMetadata: (metadata: GenerationMetadata) => void,
  setShowGenerationDetails: (show: boolean) => void
) => {
  const { getDebugInfo } = useDebugInfo();

  const createDebugButtonProps = (
    fallbackPrompts?: { systemPrompt?: string; userPrompt?: string },
    modelSettings?: { model?: string; temperature?: number; maxTokens?: number }
  ) => ({
    stationKey,
    stationName,
    fallbackPrompts,
    modelSettings,
    setCurrentGenerationMetadata,
    setShowGenerationDetails
  });

  const getDebugInfoForStation = () => getDebugInfo(stationKey);

  return {
    createDebugButtonProps,
    getDebugInfoForStation
  };
};