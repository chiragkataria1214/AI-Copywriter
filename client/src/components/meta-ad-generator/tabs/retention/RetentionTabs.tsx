import { RetentionTab } from './RetentionTab';
import { createTabProps, createDefaultMutation } from '../../shared';

export const RetentionTabs = (props: any) => {
    // Extract form state and handlers
    const { formState, handleInputChange, handleFormChange, contentRevision, ...restProps } = props;
    
    // Keyword management functions
    const addRetentionKeyword = (keyword: string, isAvoid?: boolean) => {
        const currentKeywords = isAvoid ? 
            formState?.retentionWordsToAvoid || [] : 
            formState?.retentionKeywordsToInclude || [];
        const updatedKeywords = [...currentKeywords, keyword];
        const fieldName = isAvoid ? 'retentionWordsToAvoid' : 'retentionKeywordsToInclude';
        if (handleInputChange) {
            handleInputChange(fieldName)(updatedKeywords);
        }
    };

    const removeRetentionKeyword = (keyword: string, isAvoid?: boolean) => {
        const currentKeywords = isAvoid ? 
            formState?.retentionWordsToAvoid || [] : 
            formState?.retentionKeywordsToInclude || [];
        const updatedKeywords = currentKeywords.filter((k: string) => k !== keyword);
        const fieldName = isAvoid ? 'retentionWordsToAvoid' : 'retentionKeywordsToInclude';
        if (handleInputChange) {
            handleInputChange(fieldName)(updatedKeywords);
        }
    };
    
    // Use shared utility to create tab props
    const retentionTabProps = createTabProps(formState, handleInputChange, {
        ...restProps,
        
        // Generated content (not in form state, would need separate hook)
        generatedRetentionCopy: '', // Would need retention generation hook
        retentionCopyHistory: [], // Would need separate state management
        
        // Functions
        addRetentionKeyword,
        removeRetentionKeyword,
        getBrandDrLabel: restProps.getBrandDrLabel || (() => '50% Brand / 50% DR'),
        copyToClipboard: () => Promise.resolve(),
        
        // Mutations from generationMutations hook
        generateRetentionCopyMutation: props.generationMutations?.generateRetentionCopyMutation || createDefaultMutation(),
        
        // Revision states from contentRevision hook
        setSelectedItemForRevision: contentRevision?.setSelectedItemForRevision || (() => {}),
        setRevisionInstructions: () => {}, // Would need revision hook
        setShowRevisionPanel: contentRevision?.setShowRevisionPanel || (() => {}),
        
        // Debug info
        debugInfo: null,
        retentionDebugInfo: null,
    });
    
    return <RetentionTab {...retentionTabProps} />;
};