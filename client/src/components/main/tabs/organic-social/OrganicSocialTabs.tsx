import { OrganicSocialTab } from '@/components/main/tabs/organic-social/OrganicSocialTab';
import { createTabProps, createDefaultMutation } from '@/components/main/shared';

export const OrganicSocialTabs = (props: any) => {
    // Extract form state and handlers
    const { formState, handleInputChange, contentRevision, ...restProps } = props;
    
    // Use shared utility to create tab props
    const organicSocialTabProps = createTabProps(formState, handleInputChange, {
        ...restProps,
        
        // Organic Social specific props
        organicSocialType: props.organicSocialType,
        setOrganicSocialType: props.setOrganicSocialType,
        organicContentType: formState.organicContentType,
        setOrganicContentType: props.setOrganicContentType,
        organicVideoFile: props.organicVideoFile,
        setOrganicVideoFile: props.setOrganicVideoFile,
        organicVideoTranscription: formState.organicVideoTranscription,
        setOrganicVideoTranscription: props.setOrganicVideoTranscription,
        organicImageFile: props.organicImageFile,
        setOrganicImageFile: props.setOrganicImageFile,
        organicImagePreview: formState.organicImagePreview,
        setOrganicImagePreview: props.setOrganicImagePreview,
        organicPlatform: formState.organicPlatform,
        setOrganicPlatform: props.setOrganicPlatform,
        organicGoal: formState.organicGoal,
        setOrganicGoal: props.setOrganicGoal,
        organicTone: formState.organicTone,
        setOrganicTone: props.setOrganicTone,
        generatedCaptions: formState.generatedCaptions,
        setGeneratedCaptions: props.setGeneratedCaptions,
        captionVariations: formState.captionVariations,
        setCaptionVariations: props.setCaptionVariations,
        storyContentType: formState.storyContentType,
        setStoryContentType: props.setStoryContentType,
        storyVideoTranscription: formState.storyVideoTranscription,
        setStoryVideoTranscription: props.setStoryVideoTranscription,
        storyVideoFile: props.storyVideoFile,
        setStoryVideoFile: props.setStoryVideoFile,
        storyImageFile: props.storyImageFile,
        setStoryImageFile: props.setStoryImageFile,
        storyImagePreview: formState.storyImagePreview,
        setStoryImagePreview: props.setStoryImagePreview,
        storySequenceType: formState.storySequenceType,
        setStorySequenceType: props.setStorySequenceType,
        storyLength: formState.storyLength,
        setStoryLength: props.setStoryLength,
        storyTone: formState.storyTone,
        setStoryTone: props.setStoryTone,
        generatedStorySequence: formState.generatedStorySequence,
        setGeneratedStorySequence: props.setGeneratedStorySequence,
        organicSelectedProducts: formState.organicSelectedProducts,
        setOrganicSelectedProducts: props.setOrganicSelectedProducts,
        storySelectedProducts: formState.storySelectedProducts,
        setStorySelectedProducts: props.setStorySelectedProducts,
        strategicInsights: props.strategicInsights,
        setStrategicInsights: props.setStrategicInsights,
        isGeneratingCaptions: props.isGeneratingCaptions,
        setIsGeneratingCaptions: props.setIsGeneratingCaptions,
        isGeneratingStory: props.isGeneratingStory,
        setIsGeneratingStory: props.setIsGeneratingStory,
        
        // Debug info manager
        debugInfoManager: props.debugInfoManager,
        
        // Revision states from contentRevision hook
        setSelectedItemForRevision: contentRevision?.setSelectedItemForRevision || (() => {}),
        setShowRevisionPanel: contentRevision?.setShowRevisionPanel || (() => {}),
    });
    
    return <OrganicSocialTab {...organicSocialTabProps} />;
};