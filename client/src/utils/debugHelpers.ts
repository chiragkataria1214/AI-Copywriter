import { DebugInfo, StationKey } from '@/hooks/generation/useDebugInfo';
import { GenerationMetadata } from '@/components/main/shared/types';

/**
 * Standardized debug info processing utilities
 */

/**
 * Process backend debug response into standardized format
 */
export const processBackendDebugInfo = (
  backendDebugInfo: any,
  requestPayload: any,
  stationName: string,
  modelSettings?: { model?: string; temperature?: number; maxTokens?: number }
): DebugInfo => {
  return {
    systemPrompt: backendDebugInfo?.systemPrompt || '',
    userPrompt: backendDebugInfo?.userPrompt || '',
    requestPayload: requestPayload,
    rawResponse: backendDebugInfo?.rawResponse || '',
    stationName,
    timestamp: new Date().toISOString(),
    modelUsed: modelSettings?.model || 'Claude Sonnet 4.0',
    temperature: modelSettings?.temperature || 0.7,
    maxTokens: modelSettings?.maxTokens || 2000
  };
};

/**
 * Convert DebugInfo to GenerationMetadata format for modal display
 */
export const debugInfoToGenerationMetadata = (debugInfo: DebugInfo): GenerationMetadata => {
  return {
    stationName: debugInfo.stationName,
    timestamp: debugInfo.timestamp,
    modelUsed: debugInfo.modelUsed || 'Claude Sonnet 4.0',
    temperature: debugInfo.temperature,
    maxTokens: debugInfo.maxTokens,
    systemPrompt: debugInfo.systemPrompt,
    userPrompt: debugInfo.userPrompt,
    requestPayload: debugInfo.requestPayload,
    rawResponse: debugInfo.rawResponse
  };
};

/**
 * Create fallback GenerationMetadata when debug info is not available
 */
export const createFallbackGenerationMetadata = (
  stationName: string,
  fallbackPrompts: { systemPrompt?: string; userPrompt?: string },
  modelSettings?: { model?: string; temperature?: number; maxTokens?: number }
): GenerationMetadata => {
  return {
    stationName,
    timestamp: new Date().toISOString(),
    modelUsed: modelSettings?.model || 'Claude Sonnet 4.0',
    temperature: modelSettings?.temperature || 0.7,
    maxTokens: modelSettings?.maxTokens || 2000,
    systemPrompt: fallbackPrompts.systemPrompt || `Expert ${stationName.toLowerCase()} copywriter...`,
    userPrompt: fallbackPrompts.userPrompt || `Generating ${stationName.toLowerCase()} content...`,
    requestPayload: undefined,
    rawResponse: undefined
  };
};

/**
 * Standardized debug info setter factory
 * Creates a setter function that processes backend response consistently
 */
export const createDebugInfoSetter = (
  setDebugInfo: (stationKey: string, debugInfo: DebugInfo | null) => void,
  stationKey: StationKey,
  stationName: string,
  modelSettings?: { model?: string; temperature?: number; maxTokens?: number }
) => {
  return (backendResponse: any, requestPayload: any) => {
    if (backendResponse?.debugInfo) {
      const processedDebugInfo = processBackendDebugInfo(
        backendResponse.debugInfo,
        requestPayload,
        stationName,
        modelSettings
      );
      setDebugInfo(stationKey, processedDebugInfo);
      
      // Optional: Log for debugging
      // console.log(`🐛 Debug info set for ${stationName}:`, processedDebugInfo);
    }
  };
};