# Standardized Debug Info Migration Guide

## Why Standardize?

Currently, our debug info handling is inconsistent across stations:

### Current Problems:
1. **Inconsistent State Management**: Each station has its own debug info state
2. **Redundant Props**: Components receive both generic and specific debug props
3. **Manual Processing**: Each station manually processes backend responses differently
4. **Code Duplication**: Similar debug logic repeated across components
5. **Maintenance Burden**: Changes require updates in multiple places

### Benefits of Standardization:
1. **Single Source of Truth**: Centralized debug info management
2. **Consistent Interface**: Same pattern for all stations
3. **Automatic Processing**: Standardized backend response handling
4. **Reduced Code Duplication**: Shared utilities and components
5. **Easier Maintenance**: Changes in one place affect all stations

## New Standardized Pattern

### 1. Centralized State Management
```tsx
// OLD: Individual states for each station
const [staticAdDebugInfo, setStaticAdDebugInfo] = useState(null);
const [customRequestDebugInfo, setCustomRequestDebugInfo] = useState(null);
const [landingPageDebugInfo, setLandingPageDebugInfo] = useState(null);

// NEW: Single centralized debug state
const { setDebugInfo, getDebugInfo } = useDebugInfo();
```

### 2. Standardized Processing
```tsx
// OLD: Manual processing in each mutation
if (result.debugInfo && props.setStaticAdDebugInfo) {
  props.setStaticAdDebugInfo({
    systemPrompt: result.debugInfo.systemPrompt,
    userPrompt: result.debugInfo.userPrompt,
    requestPayload: payload,
    rawResponse: result.debugInfo.rawResponse
  });
}

// NEW: Automatic standardized processing
const setStaticAdDebugInfo = createDebugInfoSetter(
  setDebugInfo, 
  STATION_KEYS.STATIC_AD, 
  'Static Ad Analysis', 
  modelSettings
);
setStaticAdDebugInfo(result, payload); // Handles all processing automatically
```

### 3. Standardized Component Interface
```tsx
// OLD: Manual debug button implementation
<Button
  variant="outline"
  size="sm"
  onClick={() => {
    setCurrentGenerationMetadata({
      stationName: 'Static Ad Analysis',
      timestamp: new Date().toISOString(),
      modelUsed: modelSettings?.model || 'Claude Sonnet 4.0',
      temperature: modelSettings?.temperature || 0.7,
      maxTokens: modelSettings?.maxTokens || 2000,
      systemPrompt: staticAdDebugInfo?.systemPrompt || fallbackPrompt,
      userPrompt: staticAdDebugInfo?.userPrompt || fallbackUserPrompt,
      requestPayload: staticAdDebugInfo?.requestPayload,
      rawResponse: staticAdDebugInfo?.rawResponse
    });
    setShowGenerationDetails(true);
  }}
>
  <Eye size={12} className="mr-1" />
  Details
</Button>

// NEW: Standardized debug button
<StandardizedDebugButton
  stationKey={STATION_KEYS.STATIC_AD}
  stationName="Static Ad Analysis"
  fallbackPrompts={{
    systemPrompt: stationPrompts?.staticAd?.systemPrompt,
    userPrompt: `Analysis Focus: ${analysisFocus}...`
  }}
  modelSettings={modelSettings}
  setCurrentGenerationMetadata={setCurrentGenerationMetadata}
  setShowGenerationDetails={setShowGenerationDetails}
/>
```

## Migration Steps

### Step 1: Update Main Component (index.tsx)
```tsx
// Replace individual debug states with centralized management
import { useDebugInfo } from '@/hooks/generation/useDebugInfo';

const MetaAdGeneratorContent = () => {
  // OLD: Remove individual debug states
  // const [staticAdDebugInfo, setStaticAdDebugInfo] = useState(null);
  // const [customRequestDebugInfo, setCustomRequestDebugInfo] = useState(null);
  
  // NEW: Use centralized debug management
  const debugInfo = useDebugInfo();
  
  // Pass debugInfo to generation hook
  const generationMutations = useGenerationStandardized({
    // ... existing props
    modelSettings: modelSettings,
    debugInfo: debugInfo // Pass entire debug management
  });
};
```

### Step 2: Update Generation Hook
```tsx
// Use the new standardized generation hook
import { useGenerationStandardized } from '@/hooks/generation/useGenerationStandardized';

// Replace existing useGeneration with useGenerationStandardized
const generationMutations = useGenerationStandardized({
  // ... all existing props
  modelSettings: modelSettings // Required for debug info
});
```

### Step 3: Update Components
```tsx
// Replace manual debug buttons with standardized component
import { StandardizedDebugButton } from '@/components/common/StandardizedDebugButton';
import { STATION_KEYS } from '@/hooks/generation/useDebugInfo';

// In your component
<StandardizedDebugButton
  stationKey={STATION_KEYS.STATIC_AD}
  stationName="Static Ad Analysis"
  fallbackPrompts={{
    systemPrompt: stationPrompts?.staticAd?.systemPrompt || `Expert static ad analyzer...`,
    userPrompt: `Analysis Focus: ${analysisFocus}\nTarget Persona: ${persona}...`
  }}
  modelSettings={modelSettings}
  setCurrentGenerationMetadata={setCurrentGenerationMetadata}
  setShowGenerationDetails={setShowGenerationDetails}
  disabled={!hasGeneratedContent}
/>
```

### Step 4: Remove Legacy Debug Props
```tsx
// Remove debug info props from component interfaces
interface StaticAdTabProps {
  // OLD: Remove these
  // staticAdDebugInfo?: DebugInfo | null;
  // debugInfo?: DebugInfo | null;
  
  // Keep only essential props
  modelSettings?: ModelSettings;
  stationPrompts?: StationPrompts;
  setCurrentGenerationMetadata: (metadata: GenerationMetadata) => void;
  setShowGenerationDetails: (show: boolean) => void;
}
```

## Station Keys Reference

```tsx
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
```

## Benefits After Migration

1. **Consistent Experience**: All stations work exactly the same way
2. **Easier Debugging**: Centralized debug info makes troubleshooting easier
3. **Reduced Bundle Size**: Less code duplication
4. **Better Type Safety**: Standardized interfaces prevent errors
5. **Faster Development**: New stations can reuse existing patterns

## Testing the Migration

1. **Verify Debug Info Display**: Check that Generation Details modal shows correct info for all stations
2. **Check Console Logs**: Ensure standardized debug logs appear consistently
3. **Test Fallback Behavior**: Verify fallback prompts work when debug info is unavailable
4. **Validate All Stations**: Test debug functionality across all generation types

## Rollback Plan

If issues arise, the migration can be rolled back by:
1. Reverting to individual debug states in index.tsx
2. Using the original useGeneration hook
3. Restoring manual debug button implementations

The new standardized files can coexist with the old system during transition.