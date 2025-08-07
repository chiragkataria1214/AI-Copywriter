import { LandingPageTab } from './LandingPageTab';
import { createTabProps, createDefaultMutation } from '../../shared';

export const LandingPageTabs = (props: any) => {
    // Extract form state and handlers
    const { formState, handleInputChange, handleFormChange, adCopyGeneration, contentRevision, ...restProps } = props;
    
    // Use shared utility to create tab props
    const landingPageTabProps = createTabProps(formState, handleInputChange, {
        ...restProps,
        
        // Generated content setters (would be populated by separate hook)
        setGeneratedLandingCopy: () => {},
        landingPageAnalysis: null,
        copiedLandingCopy: false,
        getBrandDrLabel: restProps.getBrandDrLabel || (() => '50% Brand / 50% DR'),
        
        // Generated Ad States from adCopyGeneration hook
        generatedHeadlines: adCopyGeneration?.generatedHeadlines || [],
        generatedPrimaryText: adCopyGeneration?.generatedPrimaryText || '',
        selectedHeadlineIndex: adCopyGeneration?.selectedHeadlineIndex || 0,
        setSelectedHeadlineIndex: adCopyGeneration?.setSelectedHeadlineIndex || (() => {}),
        
        // Functions from hooks
        generateAdCopy: () => adCopyGeneration?.generateAdCopyMutation?.mutate(),
        generateLandingCopyMutation: props.generationMutations?.generateLandingCopyMutation || createDefaultMutation(),
        copyToClipboard: adCopyGeneration?.copyToClipboard || (() => Promise.resolve()),
        
        // Revision states from contentRevision hook
        setSelectedItemForRevision: contentRevision?.setSelectedItemForRevision || (() => {}),
        setShowRevisionPanel: contentRevision?.setShowRevisionPanel || (() => {}),
        
        // Generated content and debug info
        generatedLandingCopy: props.generatedLandingCopy || {},
        debugInfo: null,
        landingPageDebugInfo: props.landingPageDebugInfo || null,
    });
    
    return <LandingPageTab {...landingPageTabProps} />;
};