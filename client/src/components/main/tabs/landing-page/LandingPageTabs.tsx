import { LandingPageTab } from '@/components/main/tabs/landing-page/LandingPageTab';
import { createTabProps, createDefaultMutation } from '@/components/main/shared';

export const LandingPageTabs = (props: any) => {
    // Extract form state and handlers
    const { formState, handleInputChange, handleFormChange, adCopyGeneration, contentRevision, ...restProps } = props;
    
    // Use shared utility to create tab props
    const landingPageTabProps = createTabProps(formState, handleInputChange, {
        ...restProps,
        
        // Generated content setters
        setGeneratedLandingCopy: props.setGeneratedLandingCopy || (() => {}),
        landingPageAnalysis: props.landingPageAnalysis || null,
        copiedLandingCopy: props.uiState?.copiedStates?.landingCopy || false,
        getBrandDrLabel: restProps.getBrandDrLabel || (() => '50% Brand / 50% DR'),
        
        // Generated Ad States from adCopyGeneration hook
        generatedHeadlines: adCopyGeneration?.generatedHeadlines || [],
        generatedPrimaryText: adCopyGeneration?.generatedPrimaryText || '',
        selectedHeadlineIndex: adCopyGeneration?.selectedHeadlineIndex || 0,
        setSelectedHeadlineIndex: adCopyGeneration?.setSelectedHeadlineIndex || (() => {}),
        
        // Functions from hooks
        generateAdCopy: () => adCopyGeneration?.generateAdCopyMutation?.mutate(),
        generateLandingCopyMutation: props.generationMutations?.generateLandingCopyMutation || createDefaultMutation(),
        copyToClipboard: async (text: string, type: string) => {
            try {
                await navigator.clipboard.writeText(text);
                if (type === 'landing' && props.setCopiedWithTimeout) {
                    props.setCopiedWithTimeout('landingCopy');
                } else if (adCopyGeneration?.copyToClipboard) {
                    return adCopyGeneration.copyToClipboard(text, type);
                }
            } catch (error) {
                console.error('Failed to copy to clipboard:', error);
            }
        },
        
        // Revision states from contentRevision hook
        setSelectedItemForRevision: contentRevision?.setSelectedItemForRevision || (() => {}),
        setShowRevisionPanel: contentRevision?.setShowRevisionPanel || (() => {}),
        
        // Generated content and debug info
        generatedLandingCopy: props.generatedLandingCopy || {},
        debugInfoManager: props.debugInfoManager,
    });
    
    return <LandingPageTab {...landingPageTabProps} />;
};