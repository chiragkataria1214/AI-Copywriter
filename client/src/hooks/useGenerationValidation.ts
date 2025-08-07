import { useMemo } from 'react';

interface GenerationValidationProps {
  modelSettings: any;
  stationPrompts: any;
}

export const useGenerationValidation = ({ modelSettings, stationPrompts }: GenerationValidationProps) => {
  
  // Helper function to check if generation buttons should be disabled
  const getGenerationDisabledState = useMemo(() => {
    return (stationType: 'adCopy' | 'landingPage' | 'customRequest' | 'emailSmsRetention' | 'staticAd') => {
      // Check if model settings are configured
      const hasModelName = modelSettings?.model && modelSettings.model.trim() !== '';
      const hasMaxTokens = modelSettings?.maxTokens && modelSettings.maxTokens > 0;

      // Check if station-specific prompt exists
      let hasStationPrompt = false;
      let stationPromptReason = '';

      switch (stationType) {
        case 'adCopy':
          hasStationPrompt = stationPrompts?.adCopy?.systemPrompt && stationPrompts.adCopy.systemPrompt.trim() !== '';
          stationPromptReason = 'Ad Copy system prompt is not configured';
          break;
        case 'landingPage':
          hasStationPrompt = stationPrompts?.landingPage?.systemPrompt && stationPrompts.landingPage.systemPrompt.trim() !== '';
          stationPromptReason = 'Landing Page system prompt is not configured';
          break;
        case 'customRequest':
          hasStationPrompt = stationPrompts?.customRequest?.systemPrompt && stationPrompts.customRequest.systemPrompt.trim() !== '';
          stationPromptReason = 'Custom Request system prompt is not configured';
          break;
        case 'emailSmsRetention':
          hasStationPrompt = stationPrompts?.emailSmsRetention?.systemPrompt && stationPrompts.emailSmsRetention.systemPrompt.trim() !== '';
          stationPromptReason = 'Email/SMS Retention system prompt is not configured';
          break;
        case 'staticAd':
          hasStationPrompt = stationPrompts?.staticAd?.systemPrompt && stationPrompts.staticAd.systemPrompt.trim() !== '';
          stationPromptReason = 'Static Ad system prompt is not configured';
          break;
      }

      const reasons = [];
      if (!hasModelName) reasons.push('Model name is not set');
      if (!hasMaxTokens) reasons.push('Max tokens is not set');
      if (!hasStationPrompt) reasons.push(stationPromptReason);

      return {
        disabled: !hasModelName || !hasMaxTokens || !hasStationPrompt,
        reason: reasons.join(', ')
      };
    };
  }, [modelSettings, stationPrompts]);

  return {
    getGenerationDisabledState
  };
};