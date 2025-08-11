import { useState, useCallback } from 'react';

export interface DebugInfo {
  systemPrompt: string;
  userPrompt: string;
  requestPayload: any;
  rawResponse: string;
  stationName: string;
  timestamp: string;
  modelUsed?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface DebugInfoState {
  [stationKey: string]: DebugInfo | null;
}

/**
 * Centralized debug info management hook
 * Provides a consistent interface for all stations to store and retrieve debug info
 */
export const useDebugInfo = () => {
  const [debugInfoState, setDebugInfoState] = useState<DebugInfoState>({});

  // Generic setter that works for any station
  const setDebugInfo = useCallback((stationKey: string, debugInfo: DebugInfo | null) => {
    setDebugInfoState(prev => ({
      ...prev,
      [stationKey]: debugInfo
    }));
  }, []);

  // Generic getter for any station
  const getDebugInfo = useCallback((stationKey: string): DebugInfo | null => {
    return debugInfoState[stationKey] || null;
  }, [debugInfoState]);

  // Clear debug info for a specific station
  const clearDebugInfo = useCallback((stationKey: string) => {
    setDebugInfoState(prev => {
      const newState = { ...prev };
      delete newState[stationKey];
      return newState;
    });
  }, []);

  // Clear all debug info
  const clearAllDebugInfo = useCallback(() => {
    setDebugInfoState({});
  }, []);

  // Get all debug info (useful for debugging)
  const getAllDebugInfo = useCallback(() => {
    return debugInfoState;
  }, [debugInfoState]);

  return {
    setDebugInfo,
    getDebugInfo,
    clearDebugInfo,
    clearAllDebugInfo,
    getAllDebugInfo,
    debugInfoState
  };
};

// Station key constants to ensure consistency
export const STATION_KEYS = {
  STATIC_AD: 'staticAd',
  AD_COPY: 'adCopy',
  CUSTOM_REQUEST: 'customRequest',
  LANDING_PAGE: 'landingPage',
  RETENTION_EMAIL: 'retentionEmail',
  RETENTION_SMS: 'retentionSms',
  ORGANIC_SOCIAL: 'organicSocial',
  STORY_SEQUENCE: 'storySequence',
  REVISION: 'revision'
} as const;

export type StationKey = typeof STATION_KEYS[keyof typeof STATION_KEYS];