import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Camera } from 'lucide-react';
import { AdCopyTab } from './AdCopyTab';
import { StaticAdTab } from './StaticAdTab';
import { createTabProps, createDefaultMutation } from '../../shared';

export const PaidSocialTabs = (props: any) => {
    // Extract form state and handlers
    const { formState, handleInputChange, handleFormChange, adCopyGeneration, contentRevision, ...restProps } = props;
    
    // File upload handlers
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type === 'text/plain') {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                if (handleInputChange) {
                    handleInputChange('transcription')(content);
                }
            };
            reader.readAsText(file);
        }
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target?.result as string;
                if (handleInputChange) {
                    handleInputChange('uploadedImage')(dataUrl);
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    // Use shared utility to create tab props
    const adCopyTabProps = createTabProps(formState, handleInputChange, {
        ...restProps,
        
        // Ad copy generation props
        generateAdCopy: () => adCopyGeneration?.generateAdCopyMutation?.mutate(),
        generateAdCopyMutation: adCopyGeneration?.generateAdCopyMutation || createDefaultMutation(),
        generatedHeadlines: adCopyGeneration?.generatedHeadlines || [],
        generatedPrimaryText: adCopyGeneration?.generatedPrimaryText || '',
        copyToClipboard: adCopyGeneration?.copyToClipboard || (() => {}),
        copiedHeadlines: adCopyGeneration?.copiedHeadlines || false,
        copiedPrimaryText: adCopyGeneration?.copiedPrimaryText || false,
        selectedHeadlineIndex: adCopyGeneration?.selectedHeadlineIndex || 0,
        setSelectedHeadlineIndex: adCopyGeneration?.setSelectedHeadlineIndex || (() => {}),
        currentCopyId: adCopyGeneration?.currentCopyId || null,
        copyRating: adCopyGeneration?.copyRating || null,
        setCopyRating: adCopyGeneration?.setCopyRating || (() => {}),
        feedbackText: adCopyGeneration?.feedbackText || '',
        setFeedbackText: adCopyGeneration?.setFeedbackText || (() => {}),
        submitFeedbackMutation: adCopyGeneration?.submitFeedbackMutation || createDefaultMutation(),
        saveCopyMutation: adCopyGeneration?.saveCopyMutation || createDefaultMutation(),
        debugInfo: adCopyGeneration?.debugInfo,
        
        // Content revision props
        setSelectedItemForRevision: contentRevision?.setSelectedItemForRevision || (() => {}),
        setShowRevisionPanel: contentRevision?.setShowRevisionPanel || (() => {}),
        
        // File upload handlers
        handleFileUpload,
        handleImageUpload,
    });
    
    return (
        <Tabs value={props.paidSocialSubTab} onValueChange={props.setPaidSocialSubTab} className="w-full">
            <div className="flex justify-center mb-6">
                <TabsList className="grid grid-cols-2 w-auto">
                    <TabsTrigger value="ad-copy" className="flex items-center space-x-2">
                        <Sparkles size={16} />
                        <span>Ad Copy</span>
                    </TabsTrigger>
                    <TabsTrigger value="static-ad" className="flex items-center space-x-2">
                        <Camera size={16} />
                        <span>Static Ad</span>
                    </TabsTrigger>
                </TabsList>
            </div>

            {/* Ad Copy Sub-Tab */}
            <TabsContent value="ad-copy">
                <AdCopyTab {...adCopyTabProps} />
            </TabsContent>

            {/* Static Ad Sub-Tab */}
            <TabsContent value="static-ad">
                <StaticAdTab 
                    personas={props.personas}
                    concept={formState?.concept || ''}
                    setConcept={handleInputChange ? handleInputChange('concept') : () => {}}
                    staticAdImage={formState?.staticAdImage || ''}
                    setStaticAdImage={handleInputChange ? handleInputChange('staticAdImage') : () => {}}
                    staticAdImagePreview={formState?.staticAdImagePreview || ''}
                    setStaticAdImagePreview={handleInputChange ? handleInputChange('staticAdImagePreview') : () => {}}
                    staticAdAnalysis={formState?.staticAdAnalysis || ''}
                    setStaticAdAnalysis={handleInputChange ? handleInputChange('staticAdAnalysis') : () => {}}
                    analyzeStaticAdMutation={props.generationMutations?.analyzeStaticAdMutation}
                    getGenerationDisabledState={props.getGenerationDisabledState}
                    copyToClipboard={props.copyToClipboard}
                    selectedProducts={formState?.selectedProducts || []}
                    setSelectedProducts={handleInputChange ? handleInputChange('selectedProducts') : () => {}}
                    products={props.products}
                    brandDrBalance={formState?.brandDrBalance?.[0] || 50}
                    setCurrentGenerationMetadata={props.setCurrentGenerationMetadata}
                    setShowGenerationDetails={props.setShowGenerationDetails}
                    modelSettings={props.modelSettings}
                    stationPrompts={props.stationPrompts}
                    brandGuidelines={props.brandGuidelines}
                    copyFrameworks={props.copyFrameworks}
                    debugInfo={props.staticAdDebugInfo}
                />
            </TabsContent>
        </Tabs>
    );
}; 